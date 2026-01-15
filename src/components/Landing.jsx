import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../home-shelf-theme.css';

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
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-header" style={{ paddingBottom: '40px' }}>
        <div className="welcome-section">
          <h1 style={{ 
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px'
          }}>
            🛡️ Stop Price Fixing Together
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '32px',
            color: '#495057',
            lineHeight: '1.6'
          }}>
            🕵️ Expose unfair pricing • 📊 Compare real prices • 💪 Fight back as a community
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '24px'
          }}>
            <Link 
              to="/register" 
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #28a745, #1e7e34)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🚀 Join the Fight
            </Link>
            <button 
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '16px 32px',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#007bff',
                border: '2px solid #007bff',
                borderRadius: '16px',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📖 Learn How
            </button>
          </div>
        </div>
        
        {/* Visual Demo */}
        <div style={{ 
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #e9ecef',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600',
              marginBottom: '16px',
              color: '#495057',
              textAlign: 'center'
            }}>
              📍 Real Price Comparison
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #e8f5e8, #d4edda)',
                borderRadius: '12px',
                border: '2px solid #28a745'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#155724' }}>🏪 Local Market</div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Milk 1L</div>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#28a745', fontSize: '1.1rem' }}>₹42</div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>0.2km</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                borderRadius: '12px',
                border: '2px solid #ffc107'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#856404' }}>🏬 Corner Shop</div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Milk 1L</div>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#856404', fontSize: '1.1rem' }}>₹48</div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>0.5km</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #f8d7da, #f1c2c7)',
                borderRadius: '12px',
                border: '2px solid #dc3545'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#721c24' }}>🏪 Premium Store</div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>Milk 1L</div>
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#dc3545', fontSize: '1.1rem' }}>₹55</div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>0.8km</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <section style={{
        background: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 154, 158, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(254, 207, 239, 0.2) 0%, transparent 50%)'
        }}></div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>🚨 The Problem We're Solving</h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.6'
            }}>Unfair pricing practices hurt consumers every day</p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px', color: 'white' }}>💸</div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Hidden Price Manipulation</h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1rem',
                lineHeight: '1.6' 
              }}>
                Stores coordinate pricing to keep costs artificially high
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px', color: 'white' }}>❓</div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>No Price Transparency</h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1rem',
                lineHeight: '1.6' 
              }}>
                You can't easily compare prices across different shops
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px', color: 'white' }}>⏱️</div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Time Wasted Shopping</h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1rem',
                lineHeight: '1.6' 
              }}>
                Visiting multiple stores to find the best prices wastes time
              </p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px', color: 'white' }}>🤐</div>
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Consumer Powerlessness</h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1rem',
                lineHeight: '1.6' 
              }}>
                Individual consumers can't fight back against unfair pricing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)'
        }}></div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '60px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>A Simple and Effective Solution</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: '40px'
            }
          }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>•</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Single platform for clarity and confidence</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>Everything you need in one place</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>↻</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Real-time updates from reliable sources</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>Always current, always accurate</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>⊞</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Easy comparison of nearby options</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>See all choices at a glance</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>✓</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Clean and intuitive user experience</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>Simple design, powerful results</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <h4 style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    margin: 0
                  }}>Price Transparency Dashboard</h4>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '8px'
                    }}>₹45</div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>Average Price</div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '8px'
                    }}>12</div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>Nearby Shops</div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '8px'
                    }}>0.3km</div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>Closest</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(245, 87, 108, 0.2) 0%, transparent 50%)'
        }}></div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '60px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>How It Works</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px 24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>1</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '12px',
                fontWeight: '600'
              }}>Open the platform</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Access our web app from any device</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px 24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>2</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '12px',
                fontWeight: '600'
              }}>Select what you're looking for</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Choose from essential goods and services</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px 24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>3</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '12px',
                fontWeight: '600'
              }}>View nearby options with key details</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>See real-time prices and locations</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px 24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>4</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '12px',
                fontWeight: '600'
              }}>Compare easily</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Side-by-side comparison of all options</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px 24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>5</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '12px',
                fontWeight: '600'
              }}>Choose the best option instantly</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Make informed decisions with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section style={{
        background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 40% 20%, rgba(79, 172, 254, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 242, 254, 0.2) 0%, transparent 50%)'
        }}></div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '60px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>Key Features</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>↻</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Real-time data updates</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Always current information you can trust</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>⊞</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Location-based results</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Find options near you automatically</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>⊡</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Simple comparison view</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Easy-to-understand side-by-side comparisons</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>✓</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Verified and reliable information</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Community-verified data for accuracy</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>⚡</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Fast and intuitive interface</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Get answers in seconds, not minutes</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>📱</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Works on mobile and desktop</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Seamless experience across all devices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section style={{
        background: 'linear-gradient(135deg, #fa709a, #fee140)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(250, 112, 154, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(254, 225, 64, 0.2) 0%, transparent 50%)'
        }}></div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '60px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>Who It's For</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>👤</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Individuals making daily decisions</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Smart shoppers who want the best deals</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>💼</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Professionals and small businesses</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Business owners optimizing their purchases</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>✓</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Users who value accuracy</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>People who demand reliable information</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: 'white'
              }}>⚡</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Anyone wanting faster choices</h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Users who value their time and money</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section style={{
        background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 60% 40%, rgba(168, 237, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(254, 214, 227, 0.2) 0%, transparent 50%)'
        }}></div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            marginBottom: '60px'
          }}>Why It Matters</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{
                color: '#2d3748',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Saves time and money</h3>
              <p style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Make better decisions faster</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{
                color: '#2d3748',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Reduces uncertainty</h3>
              <p style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Confidence in every choice</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{
                color: '#2d3748',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Encourages fair decisions</h3>
              <p style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Transparency benefits everyone</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{
                color: '#2d3748',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Builds trust through transparency</h3>
              <p style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Open information creates trust</p>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{
                color: '#2d3748',
                fontSize: '1.4rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>Empowers users with data</h3>
              <p style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>Knowledge is power</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scalability Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(118, 75, 162, 0.2) 0%, transparent 50%)'
        }}></div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '60px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>Built for the Future</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            '@media (max-width: 768px)': {
              gridTemplateColumns: '1fr',
              gap: '40px'
            }
          }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>🌍</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Designed to scale across locations</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>From local to global coverage</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>🔧</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Adaptable to multiple industries</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>Flexible platform for any sector</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>📈</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Built for long-term growth</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>Scalable architecture and design</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    color: 'white',
                    marginTop: '4px'
                  }}>⚙️</span>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.4rem',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>Flexible and extensible</h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6'
                    }}>Adapts to changing needs</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                height: '300px'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  Platform
                </div>
                <div style={{
                  position: 'absolute',
                  top: '20%',
                  left: '20%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>Local</div>
                <div style={{
                  position: 'absolute',
                  top: '20%',
                  right: '20%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>Regional</div>
                <div style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '20%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>National</div>
                <div style={{
                  position: 'absolute',
                  bottom: '20%',
                  right: '20%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>Global</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '100px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
        }}></div>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>Start Making Better Decisions Today</h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>Join a platform built to simplify choices and bring clarity where it's needed most.</p>
          <Link to="/register" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontSize: '1.2rem',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px'
          }}>
            Get Started Now
          </Link>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#2d3748',
        color: 'white',
        padding: '40px 0',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <a href="#about" style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'color 0.3s ease'
            }}>About</a>
            <a href="#how-it-works" style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'color 0.3s ease'
            }}>How It Works</a>
            <a href="#contact" style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'color 0.3s ease'
            }}>Contact</a>
            <a href="#privacy" style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'color 0.3s ease'
            }}>Privacy Policy</a>
            <a href="#terms" style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: 'color 0.3s ease'
            }}>Terms & Conditions</a>
          </div>
          <div>
            <p style={{
              margin: 0,
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem'
            }}>&copy; 2024 PriceFixing Detector. Built for transparency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;