
# 🚀 Production Deployment Steps

### Step 1: Secure Database
1. Go to Firebase Console -> Firestore Database -> **Rules**.
2. Copy the content of 'firestore.rules' (generated in this folder) and paste it there.
3. Click **Publish**.

### Step 2: Apply Indexes
1. Go to Firebase Console -> Firestore Database -> **Indexes**.
2. You can manually create the indexes found in 'firestore.indexes.json', OR...
3. Just run the app. When you try to filter by Date + Party, the console logs will give you a direct link to create the index automatically. Click those links!

### Step 3: Build the Android APK
Run the following commands in your terminal:

1. `npm run build` (Compiles the React code)
2. `npx cap sync` (Updates the Android project)
3. `npx cap open android` (Opens Android Studio)

**Inside Android Studio:**
1. Wait for Gradle Sync to finish.
2. Go to **Build** menu > **Generate Signed Bundle / APK**.
3. Choose **APK**.
4. Create a new Key Store (keep the password safe!).
5. Select "Release" build variant.
6. Click **Create**.

Your .apk file will be generated! Transfer it to your phone and install.
