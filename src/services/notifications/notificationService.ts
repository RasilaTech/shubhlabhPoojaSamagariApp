// services/notificationService.ts
import { store } from "@/store/store";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { AppState, Platform } from "react-native";
import { deviceAPI } from "../device/devices";

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
  custom_title?: string;
  custom_body?: string;
  [key: string]: string | undefined;
}

class FirebaseDataNotificationService {
  private notificationListener: any;
  private responseListener: any;
  private backgroundListener: any;
  private fcmToken: string | null = null;
  private appState: string = AppState.currentState;
  private appStateSubscription: any = null;
  private pendingNavigation: NotificationData | null = null;
  private isRouterReady = false;
  private processedNotificationId: string | null = null; // Track processed notifications

  async initialize() {
    console.log("Initializing Firebase data notification service...");

    // Track app state changes
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange
    );

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

    // Handle initial notification if app was opened from notification
    await this.handleInitialNotification();

    // Mark router as ready after a small delay to ensure router is initialized
    setTimeout(() => {
      this.isRouterReady = true;
      this.processPendingNavigation();
    }, 1000);
  }

  private handleAppStateChange = (nextAppState: string) => {
    console.log("App state changed from", this.appState, "to", nextAppState);
    this.appState = nextAppState;

    // If app becomes active and we have pending navigation, try to process it
    if (nextAppState === "active" && this.pendingNavigation) {
      setTimeout(() => this.processPendingNavigation(), 500);
    }
  };

  private processPendingNavigation() {
    if (this.pendingNavigation && this.isRouterReady) {
      console.log("Processing pending navigation:", this.pendingNavigation);
      this.navigateBasedOnData(this.pendingNavigation);
      this.pendingNavigation = null;
    }
  }

  private isAppInForeground(): boolean {
    return this.appState === "active";
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
      const payload = {
        device_token: token,
        device_type: Platform.OS,
      };

      // Dispatch the mutation using the store's dispatch function
      // .initiate() returns a promise that you can await to get the result
      const result = await store.dispatch(
        deviceAPI.endpoints.addUserDevice.initiate(payload)
      );

      // RTK Query results contain either a 'data' or 'error' key
      if ("data" in result) {
        console.log(
          "FCM token registered with backend successfully:",
          result.data
        );
        // You can also access the data property if the backend returns it
      } else if ("error" in result) {
        console.error(
          "Failed to register FCM token with backend:",
          result.error
        );
        // The error object provides more details on the failure
      }
    } catch (error) {
      console.error("Error sending FCM token to backend:", error);
    }
  }

  private setupNotificationListeners() {
    // Handle notifications (FCM messages with notification payload)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log("Notification received:", notification);
        console.log("Notification content:", notification.request.content);
        console.log("App state:", this.appState);

        const content = notification.request.content;
        const notificationTitle = content.title;
        const notificationBody = content.body;

        // Get notification data - could be in data property or directly in content
        const notificationData = content.data || {};

        // Extract orderId from the notification content or data
        const orderId = notificationData.orderId || (content as any).orderId;

        console.log("Notification title:", notificationTitle);
        console.log("Notification body:", notificationBody);
        console.log("OrderId:", orderId);
        console.log("Is app in foreground:", this.isAppInForeground());

        // Handle notification with title and body (regular FCM notification)
        if (notificationTitle && notificationBody) {
          console.log("Processing regular notification with title and body");

          // Create notification data object for processing
          const processedData: NotificationData = {
            title: notificationTitle,
            body: notificationBody,
            orderId: orderId,
            type: orderId ? "order_update" : "general",
            ...notificationData,
          };

          if (this.isAppInForeground()) {
            // App in foreground - notification is automatically shown by Expo
            console.log("App in foreground - notification shown automatically");
            // Just process the data
            this.handleNotificationData(processedData);
          } else {
            // App in background - notification is shown automatically by FCM
            console.log("App in background - notification shown by FCM");
            // Process the data
            this.handleNotificationData(processedData);
          }
        } else {
          // Handle data-only notifications (if any)
          if (Object.keys(notificationData).length > 0) {
            console.log("Processing data-only notification:", notificationData);

            if (!this.isAppInForeground()) {
              await this.createLocalNotificationFromData(
                notificationData as NotificationData
              );
            } else {
              this.handleNotificationData(notificationData as NotificationData);
            }
          }
        }
      }
    );

    // Handle notification response (when user taps on notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        const content = response.notification.request.content;
        const notificationData = content.data || {};

        // Extract orderId from the notification content or data
        const orderId = notificationData.orderId || (content as any).orderId;

        // Create processed data for navigation
        const processedData: NotificationData = {
          title: content.title || "New Notification",
          body: content.body || "You have new notification",
          orderId: orderId,
          type: orderId ? "order_update" : "general",
          ...notificationData,
        };

        console.log(
          "Processing tap interaction for notification:",
          processedData
        );
        this.handleNotificationInteraction(processedData);
      });
  }

  private async createLocalNotificationFromData(data: NotificationData) {
    try {
      // Prioritize title and body from data payload
      const title =
        data.custom_title || data.title || this.getDefaultTitle(data);
      const body = data.body || data.message || this.getDefaultBody(data);

      console.log("Creating local notification with:", {
        title,
        body,
        originalData: data,
      });

      // Ensure we have both title and body
      if (!title || !body) {
        console.warn("Missing title or body for notification:", {
          title,
          body,
        });
        return;
      }

      // Create the notification with proper channel for Android
      const notificationContent: any = {
        title: title,
        body: body,
        data: data,
        sound: "default",
      };

      // Set Android-specific properties
      if (Platform.OS === "android") {
        notificationContent.android = {
          channelId: "data-notifications",
          priority: "high",
          sticky: false,
          autoCancel: true,
        };
      }

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Show immediately
      });

      console.log("Local notification created successfully");

      // Also handle the data for processing
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
      // Create a unique identifier for this notification
      const notificationId = response.notification.request.identifier;

      // Check if we've already processed this notification
      if (this.processedNotificationId === notificationId) {
        console.log(
          "Notification already processed, skipping:",
          notificationId
        );
        return;
      }

      console.log("App opened from notification:", response);
      const content = response.notification.request.content;
      const notificationData = content.data || {};
      const orderId = notificationData.orderId || (content as any).orderId;

      const processedData: NotificationData = {
        title: content.title || "New Notification",
        body: content.body || "You have a new Notification",
        orderId: orderId,
        type: orderId ? "order_update" : "general",
        ...notificationData,
      };

      // Mark this notification as processed
      this.processedNotificationId = notificationId;

      // Handle as interaction (user tap) instead of just data processing
      this.handleNotificationInteraction(processedData);

      // Clear the last notification response to prevent re-processing
      // Note: There's no direct API to clear it, but we track it with processedNotificationId
      console.log("Marked notification as processed:", notificationId);
    }
  }

  private handleNotificationData(data: NotificationData) {
    console.log("Handling notification data:", data);

    // Process notification data here
    // This is called when notification is received (foreground or background)
    // This should NOT trigger navigation - only data processing

    // You can trigger local state updates, refresh data, etc.
    if (data?.orderId || data?.type === "order_update") {
      console.log("Order update received:", data.orderId);
      // Refresh order data, update local state, etc.
    }
  }

  private handleNotificationInteraction(data: NotificationData) {
    console.log("User interacted with notification:", data);

    // If router is not ready, store for later
    if (!this.isRouterReady) {
      console.log("Router not ready, storing navigation for later");
      this.pendingNavigation = data;
      return;
    }

    // Handle navigation when user taps notification
    this.navigateBasedOnData(data);
  }

  private navigateBasedOnData(data: NotificationData) {
    try {
      console.log("Attempting navigation with data:", data);

      // Priority 1: If there's an orderId, navigate to orders screen
      if (data?.orderId) {
        console.log("Navigating to order details for orderId:", data.orderId);
        router.push(`/orders/${data.orderId}` as any);
        return;
      }

      // Priority 2: Check for specific screen in data
      if (data?.screen) {
        console.log("Navigating to screen:", data.screen);
        router.push(data.screen as any);
        return;
      }

      // Priority 3: Check for userId
      if (data?.userId) {
        console.log("Navigating to profile for userId:", data.userId);
        router.push(`/profile/${data.userId}` as any);
        return;
      }

      // Priority 4: Navigate based on type
      if (data?.type) {
        console.log("Navigating based on type:", data.type);
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

      // Default fallback - navigate to orders if we received a notification
      console.log(
        "No specific navigation defined, navigating to orders screen"
      );
      router.push("/orders" as any);
    } catch (error) {
      console.error("Navigation error:", error);
      // Store for retry if navigation failed
      this.pendingNavigation = data;
      // Retry after a delay
      setTimeout(() => this.processPendingNavigation(), 2000);
    }
  }

  // Method to manually mark router as ready (call this from your app's main component)
  markRouterReady() {
    console.log("Router marked as ready");
    this.isRouterReady = true;
    this.processPendingNavigation();
  }

  // Reset processed notification (call this when app starts normally)
  resetProcessedNotification() {
    console.log("Resetting processed notification tracking");
    this.processedNotificationId = null;
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

  // Test notification handling with orderId
  async simulateOrderNotification(orderId: string) {
    const data: NotificationData = {
      title: "Order Update",
      body: `Order #${orderId} has been updated`,
      orderId: orderId,
      type: "order_update",
    };
    console.log("Simulating order notification:", data);
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

    // Remove app state listener using the subscription
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

export default new FirebaseDataNotificationService();
