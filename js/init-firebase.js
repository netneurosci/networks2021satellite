
function initApp(app) {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const { displayName, photoURL, providerData } = user;
      const { uid } = providerData[0];
      app.userSignedIn = true;
      app.uid = uid;
      if (displayName) {
        app.userDisplayName = displayName;
      } else {
        const json = await fetchUserInfoFromGitHub(uid);
        app.userDisplayName = json.login;
      }
      app.userPicture = photoURL;
    } else {
      app.userSignedIn = false;
      app.uid = null;
      app.userDisplayName = null;
      app.userGitHubName = null;
      app.userPicture = null;
    }
  }, function (error) {
    Sentry.captureException(error);
  });
}
function signIn(app) {
  uiConfig.signInSuccessUrl = location.pathname;
  app.displaySignIn = true;
  setTimeout(() => {
    uiAuth.start('#firebaseui-auth-container', uiConfig);
  }, 500)
}
window.signIn = signIn;
function signOut() {
  firebase.auth().signOut();
}
window.signOut = signOut;
function startFirebase() {
  uiAuth = new firebaseui.auth.AuthUI(firebase.auth());
  window.addEventListener('load', function () {
    initApp(window.app || {});
  });
}

const config = {
  apiKey: "AIzaSyD1q8d3i0jikA5jRQKcDydFbIw8v2bFRc0",
  authDomain: "cartographer-a6f04.firebaseapp.com",
  databaseURL: "https://cartographer-a6f04.firebaseio.com",
  projectId: "cartographer-a6f04",
  storageBucket: "",
  messagingSenderId: "489953549172"
};
var uiConfig = {
  signInSuccessUrl: '/',
  signInOptions: [
    firebase.auth.GithubAuthProvider.PROVIDER_ID
  ],
  signInFlow: 'popup',
  tosUrl: 'tos.html'
};
window.uiConfig = uiConfig;
var uiAuth;
window.uiAuth = uiAuth;

console.log("firebase.initializeApp");
firebase.initializeApp(config);

startFirebase();
