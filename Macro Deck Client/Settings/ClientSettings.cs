using System;
using System.Collections.Generic;
using System.Text;

namespace SuchByte.MacroDeck.Settings
{
    public class ClientSettings
    {
        public float Brightness { get; set; } = 0.2f;
        public bool AutoConnect { get; set; } = false;
        public string WakeLock { get; set; } = "Connected";
        

    }
}
