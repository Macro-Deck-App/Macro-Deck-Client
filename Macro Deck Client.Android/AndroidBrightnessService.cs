using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Util;
using Android.Views;
using Android.Widget;
using Plugin.CurrentActivity;
using SuchByte.MacroDeck;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xamarin.Forms;

[assembly: Dependency(typeof(AndroidBrightnessService))]
public class AndroidBrightnessService : IBrightnessService
{
    public void SetBrightness(float brightness)
    {
        Log.Debug("Brightness", "value: " + brightness);
        var window = CrossCurrentActivity.Current.Activity.Window;
        var attributesWindow = new WindowManagerLayoutParams();

        attributesWindow.CopyFrom(window.Attributes);
        attributesWindow.ScreenBrightness = brightness;

        window.Attributes = attributesWindow;
    }
}