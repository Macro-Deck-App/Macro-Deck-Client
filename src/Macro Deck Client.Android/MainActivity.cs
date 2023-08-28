using System;

using Android.App;
using Android.Content.PM;
using Android.Runtime;
using Android.OS;
using Xamarin.Forms;
using SuchByte.MacroDeck.Droid;
using static Android.OS.PowerManager;
using Android.Content;
using Android.Views;
using AndroidX.AppCompat.App;

[assembly: Dependency(typeof(BaseUrl_Android))]
namespace SuchByte.MacroDeck.Droid
{
    public static class AppInstance
    {
        public static MainActivity MainActivity { get; set; }
    }

    public class BaseUrl_Android : IBaseUrl
    {
        public string Get()
        {
            return "file:///android_asset/";
        }
    }

    [Activity(Label = "Macro Deck", Icon = "@mipmap/icon", Theme = "@style/MainTheme", MainLauncher = true, ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize )]
    public class MainActivity : global::Xamarin.Forms.Platform.Android.FormsAppCompatActivity
    {
        public WakeLock WakeLock;

        public bool WakeLockActive = false;

        public MainActivity()
        {
            AppInstance.MainActivity ??= this;
            AppCompatDelegate.CompatVectorFromResourcesEnabled = true;
        }

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);

            Xamarin.Essentials.Platform.Init(this, savedInstanceState);
            Forms.Init(this, savedInstanceState);

            LoadApplication(new App());

            try
            {
                PowerManager powerManager = (PowerManager)this.GetSystemService(Context.PowerService);
                WakeLock = powerManager.NewWakeLock(WakeLockFlags.Full, "Macro Deck");
            } catch { }
        }
        public override void OnRequestPermissionsResult(int requestCode, string[] permissions, [GeneratedEnum] Android.Content.PM.Permission[] grantResults)
        {
            Xamarin.Essentials.Platform.OnRequestPermissionsResult(requestCode, permissions, grantResults);

            base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
        }


        protected override void OnResume()
        {
            base.OnResume();
            RemoveNavigation();
            try
            {
                if (WakeLockActive && WakeLock != null)
                {
                    WakeLock.Acquire();
                }
            }
            catch { }
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();
            try
            {
                if (WakeLock == null || !WakeLock.IsHeld) return;
                WakeLock.Release();
            } catch { }
        }

        protected override void OnPause()
        {
            base.OnPause();
            try
            {
                if (WakeLock == null || !WakeLock.IsHeld) return;
                WakeLock.Release();
            }
            catch { }
        }

        private void RemoveNavigation()
        {
            try
            {
                this.Window.AddFlags(WindowManagerFlags.Fullscreen | WindowManagerFlags.TranslucentNavigation);

                int uiOptions = (int)Window.DecorView.SystemUiVisibility;

                uiOptions |= (int)SystemUiFlags.LowProfile;
                uiOptions |= (int)SystemUiFlags.Fullscreen;
                uiOptions |= (int)SystemUiFlags.HideNavigation;
                uiOptions |= (int)SystemUiFlags.ImmersiveSticky;

                Window.DecorView.SystemUiVisibility = (StatusBarVisibility)uiOptions;
            }
            catch { }
        }
    }

    

}