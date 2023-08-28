using SuchByte.MacroDeck.Settings;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace SuchByte.MacroDeck.Views
{
    public class ConnectionStateChangedEventArgs : EventArgs
    {
        public ConnectionState State;
    }

    public class SettingsChangedEventArgs : EventArgs
    {
        public ClientSettings Settings;
    }


    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DeckPage : ContentPage
    {
        private double _width = 0;
        private double _height = 0;

        private string _host;
        public string Host { get { return this._host; } }

        public int _port;
        public int Port { get { return this._port; } }

        private string currentSettingsJson = "";

        public event EventHandler<ConnectionStateChangedEventArgs> ConnectionStateChanged;
        public event EventHandler<SettingsChangedEventArgs> SettingsChanged;

        MainPage _mainPage;
        public DeckPage(MainPage mainPage)
        {
            this._mainPage = mainPage;
            InitializeComponent();
            
        }

        public void Open(string host, int port)
        {
            this._host = host;
            this._port = port;
            string file = "file:///android_asset/index.html?device-type=" + this.DeviceType + "&client-id=" + this._mainPage.ClientId + "&connect=ws://" + this._host + ":" + this._port;
            this.webView.Source = file;
            Debug.WriteLine("Loading " + file);
        }

        public void Close()
        {
            this.webView.Source = "file:///android_asset/#closed";
        }

        protected override void OnSizeAllocated(double width, double height)
        {
            base.OnSizeAllocated(width, height); //must be called
            if (width != this._width || height != this._height)
            {
                this.webView.WidthRequest = 0;
                this.webView.HeightRequest = 0;
                this.webView.ScaleTo(0);

                this._width = width;
                this._height = height;

                Debug.WriteLine("size allocated");

                this.webView.WidthRequest = width;
                this.webView.HeightRequest = height;
                this.webView.ScaleTo(1.0);
            }
        }

        private void WebView_Navigated(object sender, WebNavigatedEventArgs e)
        {
            var newUrl = HttpUtility.UrlDecode(e.Url);
            if (newUrl.Contains('#'))
            {
                string newState = newUrl.Split('#')[1];
                ConnectionState connectionState = ConnectionState.UNKNOWN;
                Enum.TryParse(newState.ToUpper(), out connectionState);
                if (connectionState != ConnectionState.UNKNOWN && ConnectionStateChanged != null)
                {
                    Debug.WriteLine("State changed: " + connectionState.ToString());
                    ConnectionStateChanged(this, new ConnectionStateChangedEventArgs { State = connectionState });
                }
                try
                {
                    if (newState.Split(';').Length > 0)
                    {
                        string settingsJson = newState.Split(';')[1];
                        if (currentSettingsJson.Equals(settingsJson)) return;
                        Debug.WriteLine("Settings: " + settingsJson);
                        ClientSettings clientSettings = JsonConvert.DeserializeObject<ClientSettings>(settingsJson);
                        if (SettingsChanged != null)
                        {
                            SettingsChanged(this, new SettingsChangedEventArgs { Settings = clientSettings });
                        }
                    }
                } catch { }
            }
        }

        protected override bool OnBackButtonPressed()
        {
            this._mainPage.ManuallyDisconnected = true;
            this.Close();
            return true;
        }

        public DeviceType DeviceType
        {
            get
            {
                switch (Device.RuntimePlatform)
                {
                    case Device.Android:
                        return DeviceType.Android;
                    case Device.iOS:
                        return DeviceType.iOS;
                    default:
                        return DeviceType.Unknown;
                }
            }
        }
    }

    public enum DeviceType
    {
        Unknown,
        Android,
        iOS,
    }

    public enum ConnectionState
    {
        UNKNOWN,
        CONNECTING,
        CONNECTED,
        ERROR,
        CLOSED,
    }

}