import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for cached session
    const cachedSession = localStorage.getItem('userSession');
    if (currentUser || cachedSession) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Make Smarter Decisions with Real-Time Transparency
          </h1>
          <p className="hero-subtitle">
            Access verified, location-based information instantly and choose the best option without confusion or guesswork.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started Free
            </Link>
            <button className="btn btn-secondary btn-large" onClick={() => {
              document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
            }}>
              See How It Works
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="app-mockup">
            <div className="mockup-screen">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-card">
                  <div className="mockup-location">• Your Location</div>
                  <div className="mockup-items">
                    <div className="mockup-item">
                      <span className="mockup-icon">SHOP</span>
                      <div>
                        <div className="mockup-name">Local Market</div>
                        <div className="mockup-price">₹45.00</div>
                      </div>
                      <div className="mockup-distance">0.2km</div>
                    </div>
                    <div className="mockup-item">
                      <span className="mockup-icon">STORE</span>
                      <div>
                        <div className="mockup-name">Corner Shop</div>
                        <div className="mockup-price">₹48.00</div>
                      </div>
                      <div className="mockup-distance">0.5km</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="section-content">
          <h2>The Problem We Solve</h2>
          <div className="problem-grid">
            <div className="problem-item">
              <div className="problem-icon">!</div>
              <h3>Information is scattered and inconsistent</h3>
              <p>Price data is spread across multiple sources with varying accuracy</p>
            </div>
            <div className="problem-item">
              <div className="problem-icon">?</div>
              <h3>Decisions depend on guesswork</h3>
              <p>Without real-time data, you're making choices based on outdated information</p>
            </div>
            <div className="problem-item">
              <div className="problem-icon">⏱</div>
              <h3>Time wasted comparing sources</h3>
              <p>Manually checking multiple places takes time and effort</p>
            </div>
            <div className="problem-item">
              <div className="problem-icon">×</div>
              <h3>Lack of transparency leads to poor choices</h3>
              <p>Hidden information results in suboptimal decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section">
        <div className="section-content">
          <h2>A Simple and Effective Solution</h2>
          <div className="solution-grid">
            <div className="solution-text">
              <div className="solution-features">
                <div className="solution-feature">
                  <span className="feature-icon">•</span>
                  <div>
                    <h3>Single platform for clarity and confidence</h3>
                    <p>Everything you need in one place</p>
                  </div>
                </div>
                <div className="solution-feature">
                  <span className="feature-icon">↻</span>
                  <div>
                    <h3>Real-time updates from reliable sources</h3>
                    <p>Always current, always accurate</p>
                  </div>
                </div>
                <div className="solution-feature">
                  <span className="feature-icon">⊞</span>
                  <div>
                    <h3>Easy comparison of nearby options</h3>
                    <p>See all choices at a glance</p>
                  </div>
                </div>
                <div className="solution-feature">
                  <span className="feature-icon">✓</span>
                  <div>
                    <h3>Clean and intuitive user experience</h3>
                    <p>Simple design, powerful results</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="solution-visual">
              <div className="dashboard-mockup">
                <div className="dashboard-header">
                  <h4>Price Transparency Dashboard</h4>
                </div>
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <div className="stat-number">₹45</div>
                    <div className="stat-label">Average Price</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">12</div>
                    <div className="stat-label">Nearby Shops</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">0.3km</div>
                    <div className="stat-label">Closest</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-content">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Open the platform</h3>
              <p>Access our web app from any device</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Select what you're looking for</h3>
              <p>Choose from essential goods and services</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>View nearby options with key details</h3>
              <p>See real-time prices and locations</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Compare easily</h3>
              <p>Side-by-side comparison of all options</p>
            </div>
            <div className="step-card">
              <div className="step-number">5</div>
              <h3>Choose the best option instantly</h3>
              <p>Make informed decisions with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section">
        <div className="section-content">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-large">↻</div>
              <h3>Real-time data updates</h3>
              <p>Always current information you can trust</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">⊞</div>
              <h3>Location-based results</h3>
              <p>Find options near you automatically</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">⊡</div>
              <h3>Simple comparison view</h3>
              <p>Easy-to-understand side-by-side comparisons</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">✓</div>
              <h3>Verified and reliable information</h3>
              <p>Community-verified data for accuracy</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">⚡</div>
              <h3>Fast and intuitive interface</h3>
              <p>Get answers in seconds, not minutes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-large">📱</div>
              <h3>Works on mobile and desktop</h3>
              <p>Seamless experience across all devices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="audience-section">
        <div className="section-content">
          <h2>Who It's For</h2>
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">👤</div>
              <h3>Individuals making daily decisions</h3>
              <p>Smart shoppers who want the best deals</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">💼</div>
              <h3>Professionals and small businesses</h3>
              <p>Business owners optimizing their purchases</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">✓</div>
              <h3>Users who value accuracy</h3>
              <p>People who demand reliable information</p>
            </div>
            <div className="audience-card">
              <div className="audience-icon">⚡</div>
              <h3>Anyone wanting faster choices</h3>
              <p>Users who value their time and money</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="impact-section">
        <div className="section-content">
          <h2>Why It Matters</h2>
          <div className="impact-grid">
            <div className="impact-item">
              <h3>Saves time and money</h3>
              <p>Make better decisions faster</p>
            </div>
            <div className="impact-item">
              <h3>Reduces uncertainty</h3>
              <p>Confidence in every choice</p>
            </div>
            <div className="impact-item">
              <h3>Encourages fair decisions</h3>
              <p>Transparency benefits everyone</p>
            </div>
            <div className="impact-item">
              <h3>Builds trust through transparency</h3>
              <p>Open information creates trust</p>
            </div>
            <div className="impact-item">
              <h3>Empowers users with data</h3>
              <p>Knowledge is power</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scalability Section */}
      <section className="scalability-section">
        <div className="section-content">
          <h2>Built for the Future</h2>
          <div className="scalability-content">
            <div className="scalability-text">
              <div className="scalability-features">
                <div className="scalability-feature">
                  <span>🌍</span>
                  <div>
                    <h3>Designed to scale across locations</h3>
                    <p>From local to global coverage</p>
                  </div>
                </div>
                <div className="scalability-feature">
                  <span>🔧</span>
                  <div>
                    <h3>Adaptable to multiple industries</h3>
                    <p>Flexible platform for any sector</p>
                  </div>
                </div>
                <div className="scalability-feature">
                  <span>📈</span>
                  <div>
                    <h3>Built for long-term growth</h3>
                    <p>Scalable architecture and design</p>
                  </div>
                </div>
                <div className="scalability-feature">
                  <span>⚙️</span>
                  <div>
                    <h3>Flexible and extensible</h3>
                    <p>Adapts to changing needs</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="scalability-visual">
              <div className="network-diagram">
                <div className="network-node central">
                  <span>Platform</span>
                </div>
                <div className="network-node">Local</div>
                <div className="network-node">Regional</div>
                <div className="network-node">National</div>
                <div className="network-node">Global</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="section-content">
          <h2>Start Making Better Decisions Today</h2>
          <p>Join a platform built to simplify choices and bring clarity where it's needed most.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Now
          </Link>
          <p className="cta-subtext">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms & Conditions</a>
          </div>
          <div className="footer-brand">
            <p>&copy; 2024 PriceFixing Detector. Built for transparency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;