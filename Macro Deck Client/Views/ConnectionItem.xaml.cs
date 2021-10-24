using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace SuchByte.MacroDeck.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class ConnectionItem : ContentView
    {
        public string Connection { get; set; }

        public event EventHandler DeleteTapped;
        public event EventHandler ItemTapped;

        public ConnectionItem(string connection)
        {
            this.Connection = connection;
            InitializeComponent();
            BindingContext = this;
        }

        private void DeleteClicked(object sender, EventArgs e)
        {
            if (DeleteTapped != null)
            {
                DeleteTapped(this, EventArgs.Empty);
            }
        }

        private void OnFrameTapped(object sender, EventArgs e)
        {
            if (ItemTapped != null)
            {
                ItemTapped(this, EventArgs.Empty);
            }
        }
    }
}