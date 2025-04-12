// Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyDZYkI7asqcsdj77bAsHhPX8bZCL95tQ00",
  authDomain: "donghuacup.firebaseapp.com",
  projectId: "donghuacup",
  storageBucket: "donghuacup.firebasestorage.app",
  messagingSenderId: "373839828994",
  appId: "1:373839828994:web:b5d9fde04cfa9576742f1b",
  measurementId: "G-YP6JLB9TCV"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// 获取Firestore数据库实例
const db = firebase.firestore();

// 检查连接状态
function checkFirebaseConnection() {
  const connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      console.log("已连接到Firebase");
    } else {
      console.log("未连接到Firebase");
    }
  });
}

// 初始化时检查连接
checkFirebaseConnection();
