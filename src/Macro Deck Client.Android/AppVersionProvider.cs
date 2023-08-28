using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using SuchByte.MacroDeck.Droid;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xamarin.Forms;

[assembly: Dependency(typeof(AppVersionProvider))]
namespace SuchByte.MacroDeck.Droid
{
    public class AppVersionProvider : IAppVersionProvider
    {
        public string AppVersion
        {
            get
            {
                var context = Android.App.Application.Context;
                var info = context.PackageManager.GetPackageInfo(context.PackageName, 0);

                return info.VersionName;
            }
        }
    }
}