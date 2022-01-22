using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Util;
using Android.Views;
using Android.Widget;
using SuchByte.MacroDeck;
using SuchByte.MacroDeck.Droid;
using SuchByte.MacroDeck.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xamarin.Forms;

[assembly: Dependency(typeof(AndroidWakeLockService))]
public class AndroidWakeLockService : IWakeLockService
{
    public string WakeLockMethod { get; set; } = "Connected";

    public void SetWakeLock(bool state)
    {
        switch (WakeLockMethod)
        {
            case "Always":
                state = true;
                break;
            case "Connected":
                break;
            case "Never":
                state = false;
                break;
        }
        AppInstance.MainActivity.WakeLockActive = state;
        Log.Info("Wakelock", $"Set wakelock: { state }");
        try
        {
            if (AppInstance.MainActivity.WakeLock == null) return; Device.BeginInvokeOnMainThread(() =>
            {

                if (state)
                {
                    AppInstance.MainActivity.WakeLock.Acquire();
                }
                else
                {
                    if (!AppInstance.MainActivity.WakeLock.IsHeld) return;
                    AppInstance.MainActivity.WakeLock.Release();
                }
            });
        }
        catch { }
    }
}