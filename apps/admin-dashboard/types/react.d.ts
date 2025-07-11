declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
}

declare module 'lucide-react' {
  import * as React from 'react';
  
  export interface IconProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
  }

  export const LayoutDashboard: React.FC<IconProps>;
  export const Users: React.FC<IconProps>;
  export const MapPin: React.FC<IconProps>;
  export const Package: React.FC<IconProps>;
  export const CreditCard: React.FC<IconProps>;
  export const TrendingUp: React.FC<IconProps>;
  export const Bell: React.FC<IconProps>;
  export const Settings: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;
  export const Menu: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const Calendar: React.FC<IconProps>;
  export const Heart: React.FC<IconProps>;
  export const Newspaper: React.FC<IconProps>;
  export const Anchor: React.FC<IconProps>;
  export const Shield: React.FC<IconProps>;
  export const BarChart3: React.FC<IconProps>;
  export const MessageSquare: React.FC<IconProps>;
  export const Clock: React.FC<IconProps>;
  export const UserCheck: React.FC<IconProps>;
  export const Truck: React.FC<IconProps>;
  export const DollarSign: React.FC<IconProps>;
  export const FileText: React.FC<IconProps>;
  export const Globe: React.FC<IconProps>;
  export const Smartphone: React.FC<IconProps>;
  export const Monitor: React.FC<IconProps>;
  export const Database: React.FC<IconProps>;
  export const Zap: React.FC<IconProps>;
  export const Lock: React.FC<IconProps>;
  export const AlertTriangle: React.FC<IconProps>;
  export const CheckCircle: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
}
