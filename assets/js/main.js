document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const wrapper = document.getElementById('wrapper');
  const header = document.getElementById('header');
  const footer = document.getElementById('footer');
  const main = document.getElementById('main');
  const articles = main.querySelectorAll('article');
  const nav = header.querySelector('nav');
  const navItems = nav ? nav.querySelectorAll('li') : [];

  let locked = false;
  const delay = 325;

  // --- BREAKPOINTS ---
  const breakpoints = {
    xlarge: window.matchMedia('(min-width: 1281px) and (max-width: 1680px)'),
    large: window.matchMedia('(min-width: 981px) and (max-width: 1280px)'),
    medium: window.matchMedia('(min-width: 737px) and (max-width: 980px)'),
    small: window.matchMedia('(min-width: 481px) and (max-width: 736px)'),
    xsmall: window.matchMedia('(min-width: 361px) and (max-width: 480px)'),
    xxsmall: window.matchMedia('(max-width: 360px)')
  };

  function handleBreakpointChange(name, mql) {
    if (mql.matches) {
      console.log(`Breakpoint active: ${name}`);
      // Add your responsive logic here
    }
  }

  Object.entries(breakpoints).forEach(([name, mql]) => {
    mql.addEventListener('change', () => handleBreakpointChange(name, mql));
    if (mql.matches) {
      handleBreakpointChange(name, mql);
    }
  });

  // --- IE FLEXBOX MIN-HEIGHT BUG FIX ---
  function isIE() {
    return /MSIE |Trident\//.test(window.navigator.userAgent);
  }

  if (isIE()) {
    let flexboxFixTimeoutId;

    function fixFlexboxHeight() {
      if (wrapper.scrollHeight > window.innerHeight) {
        wrapper.style.height = 'auto';
      } else {
        wrapper.style.height = '100vh';
      }
    }

    window.addEventListener('resize', () => {
      clearTimeout(flexboxFixTimeoutId);
      flexboxFixTimeoutId = setTimeout(fixFlexboxHeight, 250);
    });

    fixFlexboxHeight();
  }

  // --- INITIAL ANIMATION ---
  window.addEventListener('load', () => {
    setTimeout(() => {
      body.classList.remove('is-preload');
    }, 100);
  });

  // --- NAVIGATION ALIGNMENT ---
  if (navItems.length % 2 === 0) {
    nav.classList.add('use-middle');
    navItems[navItems.length / 2].classList.add('is-middle');
  }

  // --- ARTICLE MANAGEMENT ---
  function showArticle(id, initial) {
    const article = main.querySelector(`#${id}`);
    if (!article) return;

    if (locked || initial) {
      body.classList.add('is-switching', 'is-article-visible');
      articles.forEach(a => a.classList.remove('active'));
      header.style.display = 'none';
      footer.style.display = 'none';
      main.style.display = 'block';
      article.style.display = 'block';
      article.classList.add('active');
      locked = false;
      setTimeout(() => {
        body.classList.remove('is-switching');
      }, initial ? 1000 : 0);
      return;
    }

    locked = true;

    if (body.classList.contains('is-article-visible')) {
      const currentArticle = main.querySelector('article.active');
      currentArticle.classList.remove('active');

      setTimeout(() => {
        currentArticle.style.display = 'none';
        article.style.display = 'block';

        setTimeout(() => {
          article.classList.add('active');
          window.scrollTo(0, 0);
          if (isIE()) fixFlexboxHeight();
          setTimeout(() => {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    } else {
      body.classList.add('is-article-visible');

      setTimeout(() => {
        header.style.display = 'none';
        footer.style.display = 'none';
        main.style.display = 'block';
        article.style.display = 'block';

        setTimeout(() => {
          article.classList.add('active');
          window.scrollTo(0, 0);
          if (isIE()) fixFlexboxHeight();
          setTimeout(() => {
            locked = false;
          }, delay);
        }, 25);
      }, delay);
    }
  }

  function hideArticle(addState) {
    const article = main.querySelector('article.active');
    if (!body.classList.contains('is-article-visible')) return;

    if (addState) {
      history.pushState(null, null, '#');
    }

    if (locked) {
      body.classList.add('is-switching');
      article.classList.remove('active');
      article.style.display = 'none';
      main.style.display = 'none';
      header.style.display = '';
      footer.style.display = '';
      body.classList.remove('is-article-visible');
      locked = false;
      body.classList.remove('is-switching');
      window.scrollTo(0, 0);
      if (isIE()) fixFlexboxHeight();
      return;
    }

    locked = true;
    article.classList.remove('active');

    setTimeout(() => {
      article.style.display = 'none';
      main.style.display = 'none';
      header.style.display = '';
      footer.style.display = '';

      setTimeout(() => {
        body.classList.remove('is-article-visible');
        window.scrollTo(0, 0);
        if (isIE()) fixFlexboxHeight();
        setTimeout(() => {
          locked = false;
        }, delay);
      }, 25);
    }, delay);
  }

  // --- CLOSE BUTTONS ---
  articles.forEach(article => {
    const close = document.createElement('div');
    close.className = 'close';
    close.textContent = 'Close';
    close.addEventListener('click', () => {
      location.hash = '';
    });
    article.appendChild(close);

    article.addEventListener('click', event => {
      event.stopPropagation();
    });
  });

  // --- EVENT LISTENERS ---
  body.addEventListener('click', () => {
    if (body.classList.contains('is-article-visible')) {
      hideArticle(true);
    }
  });

  window.addEventListener('keyup', event => {
    if (event.key === 'Escape' && body.classList.contains('is-article-visible')) {
      hideArticle(true);
    }
  });

  window.addEventListener('hashchange', event => {
    if (!location.hash || location.hash === '#') {
      event.preventDefault();
      event.stopPropagation();
      hideArticle();
    } else {
      const articleId = location.hash.substring(1);
      if (main.querySelector(`#${articleId}`)) {
        event.preventDefault();
        event.stopPropagation();
        showArticle(articleId);
      }
    }
  });

  // --- SCROLL RESTORATION ---
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  } else {
    let oldScrollPos = 0;
    let scrollPos = 0;
    const htmlBody = document.documentElement;

    window.addEventListener('scroll', () => {
      oldScrollPos = scrollPos;
      scrollPos = htmlBody.scrollTop;
    });

    window.addEventListener('hashchange', () => {
      window.scrollTo(0, oldScrollPos);
    });
  }

  // --- INITIALIZATION ---
  main.style.display = 'none';
  articles.forEach(article => {
    article.style.display = 'none';
  });

  if (location.hash && location.hash !== '#') {
    window.addEventListener('load', () => {
      showArticle(location.hash.substring(1), true);
    });
  }
});
