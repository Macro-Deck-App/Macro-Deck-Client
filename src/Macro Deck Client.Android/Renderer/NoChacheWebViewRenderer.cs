using Android.Content;
using Android.Webkit;
using SuchByte.MacroDeck.Droid.Renderer;
using System;
using Xamarin.Forms;
using Xamarin.Forms.Platform.Android;

[assembly: ExportRenderer(typeof(Xamarin.Forms.WebView), typeof(NoChacheWebViewRenderer))]
namespace SuchByte.MacroDeck.Droid.Renderer
{
    public class NoChacheWebViewRenderer : WebViewRenderer
    {
        public NoChacheWebViewRenderer(Context context) : base(context)
        {
            if (Control == null) return;

            Control.ClearCache(true);
            Control.Settings.SetAppCacheEnabled(false);
            Control.Settings.CacheMode = CacheModes.NoCache;
        }

    }
}