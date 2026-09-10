import { NavLink, Link } from 'react-router-dom'
import './Navbar.css'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Discover', path: '/discover' },
  { label: 'AI Match', path: '/ai-match' },
  { label: 'Payment & Trust', path: '/payment-trust' },
  { label: 'Smart Access', path: '/smart-access' },
  { label: 'Predictive Tracking', path: '/predictive-tracking' },
]

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-dot"></span>
          <span>ResourceLink</span>
        </Link>

        {/* Navigation */}
        <nav className="navbar-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="nav-bracket">[</span>}
                  {item.label}
                  {isActive && <span className="nav-bracket">]</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <Link to="/get-verified" className="navbar-cta">
          Get Verified Access
        </Link>

      </div>
    </header>
  )
}

export default Navbar