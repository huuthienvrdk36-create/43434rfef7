// Notifications Service
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsGateway } from './notifications.gateway';
import { EventBus, PlatformEvent, EventPayload } from '../../shared/events';
import { INotification } from './notification.schema';

interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<INotification>,
    private readonly gateway: NotificationsGateway,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Подписываемся на события при старте модуля
   */
  onModuleInit() {
    this.subscribeToEvents();
  }

  /**
   * Подписка на платформенные события
   */
  private subscribeToEvents() {
    // QUOTE events
    this.eventBus.on(PlatformEvent.QUOTE_CREATED, this.handleQuoteCreated.bind(this));
    this.eventBus.on(PlatformEvent.QUOTE_RESPONDED, this.handleQuoteResponded.bind(this));
    this.eventBus.on(PlatformEvent.QUOTE_ACCEPTED, this.handleQuoteAccepted.bind(this));
    this.eventBus.on(PlatformEvent.QUOTE_CANCELLED, this.handleQuoteCancelled.bind(this));

    // BOOKING events
    this.eventBus.on(PlatformEvent.BOOKING_CREATED, this.handleBookingCreated.bind(this));
    this.eventBus.on(PlatformEvent.BOOKING_CONFIRMED, this.handleBookingConfirmed.bind(this));
    this.eventBus.on(PlatformEvent.BOOKING_STARTED, this.handleBookingStarted.bind(this));
    this.eventBus.on(PlatformEvent.BOOKING_COMPLETED, this.handleBookingCompleted.bind(this));
    this.eventBus.on(PlatformEvent.BOOKING_CANCELLED, this.handleBookingCancelled.bind(this));
  }

  // ============ EVENT HANDLERS ============

  private async handleQuoteCreated(payload: EventPayload) {
    const { quoteId, customerId, cityId, description } = payload.data;
    
    // Уведомляем провайдеров в городе (логика будет расширена)
    // Пока просто логируем
    console.log(`[NotificationsService] QUOTE_CREATED: ${quoteId} in city ${cityId}`);
    
    // TODO: Найти провайдеров в городе и уведомить их
    // const providers = await this.findProvidersByCity(cityId);
    // for (const provider of providers) {
    //   await this.send({
    //     userId: provider.ownerId,
    //     type: PlatformEvent.QUOTE_CREATED,
    //     title: 'Новая заявка',
    //     message: `Появилась новая заявка: ${description?.substring(0, 50)}...`,
    //     data: { quoteId, cityId },
    //   });
    // }
  }

  private async handleQuoteResponded(payload: EventPayload) {
    const { quoteId, customerId, providerId, responseId, price } = payload.data;
    
    // Уведомляем клиента о новом ответе
    await this.send({
      userId: customerId,
      type: PlatformEvent.QUOTE_RESPONDED,
      title: 'Новый ответ на заявку',
      message: `Получен ответ на вашу заявку. Цена: ${price} ₽`,
      data: { quoteId, responseId, price },
    });
  }

  private async handleQuoteAccepted(payload: EventPayload) {
    const { quoteId, providerId, customerId, bookingId } = payload.data;
    
    // Уведомляем провайдера
    await this.send({
      userId: providerId,
      type: PlatformEvent.QUOTE_ACCEPTED,
      title: 'Заявка принята',
      message: 'Клиент принял ваше предложение. Создано бронирование.',
      data: { quoteId, bookingId },
    });
  }

  private async handleQuoteCancelled(payload: EventPayload) {
    const { quoteId, cancelledBy, affectedUserIds } = payload.data;
    
    // Уведомляем всех затронутых пользователей
    for (const userId of affectedUserIds || []) {
      await this.send({
        userId,
        type: PlatformEvent.QUOTE_CANCELLED,
        title: 'Заявка отменена',
        message: 'Заявка была отменена.',
        data: { quoteId },
      });
    }
  }

  private async handleBookingCreated(payload: EventPayload) {
    const { bookingId, customerId, providerId, serviceName } = payload.data;
    
    // Уведомляем обе стороны
    await this.send({
      userId: customerId,
      type: PlatformEvent.BOOKING_CREATED,
      title: 'Бронирование создано',
      message: `Ваше бронирование на "${serviceName}" создано.`,
      data: { bookingId },
    });

    await this.send({
      userId: providerId,
      type: PlatformEvent.BOOKING_CREATED,
      title: 'Новое бронирование',
      message: `Новое бронирование на "${serviceName}".`,
      data: { bookingId },
    });
  }

  private async handleBookingConfirmed(payload: EventPayload) {
    const { bookingId, customerId, scheduledAt } = payload.data;
    
    await this.send({
      userId: customerId,
      type: PlatformEvent.BOOKING_CONFIRMED,
      title: 'Бронирование подтверждено',
      message: scheduledAt 
        ? `Ваше бронирование подтверждено на ${new Date(scheduledAt).toLocaleString('ru-RU')}.`
        : 'Ваше бронирование подтверждено.',
      data: { bookingId, scheduledAt },
    });
  }

  private async handleBookingStarted(payload: EventPayload) {
    const { bookingId, customerId } = payload.data;
    
    await this.send({
      userId: customerId,
      type: PlatformEvent.BOOKING_STARTED,
      title: 'Работа начата',
      message: 'Исполнитель начал работу над вашим заказом.',
      data: { bookingId },
    });
  }

  private async handleBookingCompleted(payload: EventPayload) {
    const { bookingId, customerId, providerId } = payload.data;
    
    await this.send({
      userId: customerId,
      type: PlatformEvent.BOOKING_COMPLETED,
      title: 'Работа завершена',
      message: 'Работа завершена. Пожалуйста, оставьте отзыв.',
      data: { bookingId },
    });

    await this.send({
      userId: providerId,
      type: PlatformEvent.BOOKING_COMPLETED,
      title: 'Заказ завершён',
      message: 'Заказ успешно завершён.',
      data: { bookingId },
    });
  }

  private async handleBookingCancelled(payload: EventPayload) {
    const { bookingId, customerId, providerId, cancelledBy, reason } = payload.data;
    
    const targetUserId = cancelledBy === customerId ? providerId : customerId;
    const cancellerRole = cancelledBy === customerId ? 'клиентом' : 'исполнителем';
    
    await this.send({
      userId: targetUserId,
      type: PlatformEvent.BOOKING_CANCELLED,
      title: 'Бронирование отменено',
      message: `Бронирование отменено ${cancellerRole}.${reason ? ` Причина: ${reason}` : ''}`,
      data: { bookingId, reason },
    });
  }

  // ============ CORE METHODS ============

  /**
   * Создать и отправить уведомление
   */
  async send(dto: CreateNotificationDto): Promise<INotification> {
    // Сохраняем в базу
    const notification = await this.notificationModel.create({
      userId: new Types.ObjectId(dto.userId),
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data || {},
      isRead: false,
    });

    // Отправляем через WebSocket
    this.gateway.notifyUser(dto.userId, {
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  /**
   * Получить уведомления пользователя
   */
  async getUserNotifications(
    userId: string,
    options: { limit?: number; skip?: number; unreadOnly?: boolean } = {},
  ) {
    const { limit = 50, skip = 0, unreadOnly = false } = options;
    
    const query: any = { userId: new Types.ObjectId(userId) };
    if (unreadOnly) {
      query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments(query),
      this.notificationModel.countDocuments({ 
        userId: new Types.ObjectId(userId), 
        isRead: false,
      }),
    ]);

    return {
      notifications: notifications.map(n => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        isRead: n.isRead,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
      total,
      unreadCount,
    };
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationModel.updateOne(
      { 
        _id: new Types.ObjectId(notificationId), 
        userId: new Types.ObjectId(userId),
      },
      { 
        $set: { isRead: true, readAt: new Date() },
      },
    );

    return result.modifiedCount > 0;
  }

  /**
   * Отметить все уведомления пользователя как прочитанные
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return result.modifiedCount;
  }

  /**
   * Получить количество непрочитанных уведомлений
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  /**
   * Удалить уведомление
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }
}
