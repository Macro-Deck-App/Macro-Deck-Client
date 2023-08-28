using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace SuchByte.MacroDeck
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DeviceItem : ContentView
    {
        public string DeviceName { get; set; }
        public string Connection { get; set; }

        public event EventHandler DeleteTapped;
        public event EventHandler ItemTapped;

        public DeviceItem(string deviceName, string connection)
        {
            this.DeviceName = deviceName;
            this.Connection = connection;
            InitializeComponent();
            BindingContext = this;
        }


        private void Frame_Tapped(object sender, EventArgs e)
        {
            if (ItemTapped != null)
            {
                ItemTapped(this, EventArgs.Empty);
            }
        }
    }
}