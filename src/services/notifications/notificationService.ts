// services/notificationService.ts
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  screen?: string;
  userId?: string;
  orderId?: string;
  type?: string;
  title?: string;
  body?: string;
  message?: string;
  [key: string]: string | undefined;
}

class FirebaseDataNotificationService {
  private notificationListener: any;
  private responseListener: any;
  private backgroundListener: any;
  private fcmToken: string | null = null;

  async initialize() {
    console.log("Initializing Firebase data notification service...");

    // Request permissions
    const hasPermissions = await this.registerForPushNotificationsAsync();
    if (!hasPermissions) {
      console.log("Notification permissions not granted");
      return;
    }

    // Get FCM token
    await this.getFCMToken();

    // Setup notification listeners
    this.setupNotificationListeners();

    // Setup background data listener
    this.setupBackgroundDataListener();

    // Handle initial notification if app was opened from notification
    await this.handleInitialNotification();
  }

  private async registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
      });

      // Create a high priority channel for data notifications
      await Notifications.setNotificationChannelAsync("data-notifications", {
        name: "Data Notifications",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      return true;
    } else {
      console.log("Must use physical device for Push Notifications");
      return false;
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log("Must use physical device for push notifications");
        return null;
      }

      // Get the device FCM token
      const devicePushToken = await Notifications.getDevicePushTokenAsync();

      let fcmToken = null;

      if (Platform.OS === "android") {
        fcmToken = devicePushToken.data;
      } else if (Platform.OS === "ios") {
        fcmToken = devicePushToken.data;
      }

      if (fcmToken && fcmToken !== this.fcmToken) {
        this.fcmToken = fcmToken;
        console.log("FCM Token:", this.fcmToken);

        // Send token to backend
        await this.sendTokenToBackend(fcmToken);
      }

      return this.fcmToken;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  private async sendTokenToBackend(token: string) {
    try {
      // Replace with your backend endpoint
      const response = await fetch("https://fcm-test.free.beeceptor.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          fcmToken: token,
          platform: Platform.OS,
          deviceInfo: {
            deviceId: Constants.deviceId,
            deviceName: Device.deviceName,
            deviceType: Device.deviceType,
          },
          // Add user ID if you have it
          // userId: getCurrentUserId(),
        }),
      });

      if (response.ok) {
        console.log("FCM token registered with backend successfully");
      } else {
        console.error(
          "Failed to register FCM token with backend:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error sending FCM token to backend:", error);
    }
  }

  private setupNotificationListeners() {
    // Handle notification when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received in foreground:", notification);
        console.log("Notification data:", notification.request.content.data);
        this.handleNotificationData(notification.request.content.data);
      }
    );

    // Handle notification response (when user taps on notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        console.log(
          "Notification data:",
          response.notification.request.content.data
        );
        this.handleNotificationInteraction(
          response.notification.request.content.data
        );
      });
  }

  private setupBackgroundDataListener() {
    // This handles data-only messages when app is in background
    // Note: This might not work perfectly with Expo Go, works better in production builds
    this.backgroundListener = Notifications.addPushTokenListener(
      async (tokenData) => {
        console.log("Background data received:", tokenData);
      }
    );

    // Alternative: Use Notifications.addNotificationReceivedListener for data handling
    // This will also catch data-only notifications
    Notifications.addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data;

      // If this is a data-only notification (no title/body in notification object)
      if (
        !notification.request.content.title &&
        !notification.request.content.body &&
        data
      ) {
        console.log("Received data-only notification:", data);

        // Create local notification from data
        await this.createLocalNotificationFromData(data as NotificationData);
      }
    });
  }

  private async createLocalNotificationFromData(data: NotificationData) {
    try {
      // Extract title and body from data payload
      const title = data.title || this.getDefaultTitle(data);
      const body = data.body || data.message || this.getDefaultBody(data);

      console.log("Creating local notification:", { title, body, data });

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data,
          sound: "default",
        },
        trigger: null, // Show immediately
      });

      // Also handle the data for foreground processing
      this.handleNotificationData(data);
    } catch (error) {
      console.error("Error creating local notification from data:", error);
    }
  }

  private getDefaultTitle(data: NotificationData): string {
    if (data.type) {
      switch (data.type) {
        case "order_update":
          return "Order Update";
        case "message":
          return "New Message";
        case "payment":
          return "Payment Update";
        case "delivery":
          return "Delivery Update";
        default:
          return "Notification";
      }
    }
    return "New Notification";
  }

  private getDefaultBody(data: NotificationData): string {
    if (data.type) {
      switch (data.type) {
        case "order_update":
          return data.orderId
            ? `Order #${data.orderId} has been updated`
            : "Your order has been updated";
        case "message":
          return "You have a new message";
        case "payment":
          return "Payment status updated";
        case "delivery":
          return "Delivery status updated";
        default:
          return "You have a new notification";
      }
    }
    return "You have a new notification";
  }

  private async handleInitialNotification() {
    // Check if app was opened from a notification
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
      console.log("App opened from notification:", response);
      this.handleNotificationData(response.notification.request.content.data);
    }
  }

  private handleNotificationData(data: any) {
    console.log("Handling notification data:", data);

    // Process notification data here
    // This is called when notification is received (foreground or background)

    // You can trigger local state updates, refresh data, etc.
    // Example: if notification indicates new message, refresh message list
    if (data?.type === "order_update") {
      console.log("Order update received:", data.orderId);
      // Refresh order data, update local state, etc.
    }
  }

  private handleNotificationInteraction(data: any) {
    console.log("User interacted with notification:", data);
    // Handle navigation when user taps notification
    this.navigateBasedOnData(data);
  }

  private navigateBasedOnData(data: NotificationData) {
    try {
      if (data?.screen) {
        router.push(data.screen as any);
        return;
      }

      if (data?.userId) {
        router.push(`/profile/${data.userId}` as any);
        return;
      }

      if (data?.orderId) {
        router.push(`/orders/${data.orderId}` as any);
        return;
      }

      if (data?.type) {
        switch (data.type) {
          case "order_update":
            router.push("/orders" as any);
            break;
          case "message":
            router.push("/messages" as any);
            break;
          case "profile":
            router.push("/profile" as any);
            break;
          case "payment":
            router.push("/payments" as any);
            break;
          case "delivery":
            router.push("/orders" as any);
            break;
          default:
            router.push("/notifications" as any);
        }
        return;
      }

      // Default fallback
      console.log("No specific navigation defined, staying on current screen");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }

  // Send a local notification (for testing)
  async sendLocalNotification(
    title: string,
    body: string,
    data?: NotificationData
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null,
    });
  }

  // Test data-only notification handling
  async simulateDataOnlyNotification(data: NotificationData) {
    console.log("Simulating data-only notification:", data);
    await this.createLocalNotificationFromData(data);
  }

  // Get the current FCM token
  getToken(): string | null {
    return this.fcmToken;
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    if (this.backgroundListener) {
      Notifications.removeNotificationSubscription(this.backgroundListener);
    }
  }
}

export default new FirebaseDataNotificationService();
