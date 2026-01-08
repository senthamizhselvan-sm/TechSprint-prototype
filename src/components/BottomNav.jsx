import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home', iconClass: 'home' },
    { path: '/map', label: 'Shops', iconClass: 'map' },
    { path: '/report', label: 'Report', iconClass: 'report' },
    { path: '/insights', label: 'Insights', iconClass: 'insights' },
    { path: '/profile', label: 'Profile', iconClass: 'profile' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={location.pathname === item.path ? 'active' : ''}
        >
          <span className={`nav-icon ${item.iconClass}`}></span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;