import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const breadcrumbMap = {
      '': 'Home',
      'about-sachin-bansal': 'About',
      'allachievers': 'Achievers',
      'writereview': 'Write Review',
      'allreviews': 'Reviews',
      'aptitude-test': 'Aptitude Test',
      'career-aptitude-test': 'Career Test',
      'contact': 'Contact'
    };
    
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    pathnames.forEach((path, index) => {
      const fullPath = `/${pathnames.slice(0, index + 1).join('/')}`;
      const name = breadcrumbMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({ name, path: fullPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="breadcrumb-item">
            {index === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current" aria-current="page">
                {breadcrumb.name}
              </span>
            ) : (
              <Link to={breadcrumb.path} className="breadcrumb-link">
                {breadcrumb.name}
              </Link>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
