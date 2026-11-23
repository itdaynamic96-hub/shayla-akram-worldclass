(() => {
  const nav = document.getElementById('navlinks');
  if (!nav) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (id, title) => `<a class="submenu-link" href="module.html?id=${id}">${esc(title)}<span class="submenu-arrow" aria-hidden="true">↗</span></a>`;
  const branch = (title, children) => `<details class="submenu-branch"><summary>${esc(title)}<span class="branch-arrow" aria-hidden="true">▾</span></summary><div class="submenu nested">${children.join('')}</div></details>`;
  const root = (title, id, branches) => `<details class="nav-dropdown" id="${id}"><summary>${esc(title)}<span class="nav-arrow" aria-hidden="true">▾</span></summary><div class="submenu root-submenu">${branches.join('')}</div></details>`;
  const mosque = root('মসজিদ', 'mosque-menu', [
    branch('পরিচিতি ও ব্যবস্থাপনা', [link(2,'মসজিদের পরিচিতি'),link(3,'মসজিদের ইতিহাস'),link(7,'ইমাম ও খতিব পরিচিতি'),link(8,'পরিচালনা কমিটি')]),
    branch('নামাজ ও দ্বীনি কার্যক্রম', [link(4,'নামাজের সময়সূচি'),link(5,'আজানের সময়সূচি'),link(6,'জুমার নামাজের সময়'),link(13,'জুমার খুতবা আর্কাইভ'),link(14,'কোরআন ও হাদিস')]),
    branch('নোটিশ, অনুষ্ঠান ও মিডিয়া', [link(9,'নোটিশ বোর্ড'),link(10,'অনুষ্ঠানসূচি'),link(11,'ফটো গ্যালারি'),link(12,'ভিডিও গ্যালারি'),link(16,'ইসলামিক প্রবন্ধ ও ব্লগ')]),
    branch('যোগাযোগ', [link(15,'যোগাযোগ ও মানচিত্র')])
  ]);
  const foundation = root('ফাউন্ডেশন', 'foundation-menu', [
    branch('পরিচিতি ও লক্ষ্য', [link(26,'ফাউন্ডেশন পরিচিতি'),link(27,'লক্ষ্য ও উদ্দেশ্য')]),
    branch('মানবিক সহায়তা কার্যক্রম', [link(28,'দরিদ্র পরিবার সহায়তা'),link(29,'এতিম সহায়তা'),link(30,'শিক্ষাবৃত্তি ব্যবস্থাপনা'),link(31,'চিকিৎসা সহায়তা'),link(32,'দুর্যোগ ও ত্রাণ কার্যক্রম')]),
    branch('পরিচালনা ও উন্নয়ন', [link(33,'স্বেচ্ছাসেবক ব্যবস্থাপনা'),link(34,'ফাউন্ডেশন প্রকল্প')])
  ]);
  nav.innerHTML = `<a href="index.html">হোম</a>${mosque}${foundation}<a href="index.html#notices">নোটিশ</a><a href="index.html#contact">যোগাযোগ</a><a href="admin.html">অ্যাডমিন</a>`;
  const isHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');
  if (isHome) {
    document.body.classList.add('home-no-modules');
    const mosqueButton = document.querySelector('.hero .actions a[href="#mosque"]');
    const foundationButton = document.querySelector('.hero .actions a[href="#foundation"]');
    if (mosqueButton) { mosqueButton.href='module.html?id=2'; mosqueButton.textContent='মসজিদ সম্পর্কে জানুন ↗'; }
    if (foundationButton) { foundationButton.href='module.html?id=27'; foundationButton.textContent='ফাউন্ডেশনের কার্যক্রম ↗'; }
  }
  const closeMenus = () => {
    nav.classList.remove('open');
    nav.querySelectorAll('details[open]').forEach(item => item.open=false);
    const button=document.getElementById('menubtn');
    if(button){button.setAttribute('aria-expanded','false');button.textContent='মেনু ☰';}
  };
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenus));
  const button=document.getElementById('menubtn');
  if(button){
    button.setAttribute('aria-controls','navlinks');button.setAttribute('aria-expanded','false');
    button.addEventListener('click',()=>{const open=nav.classList.toggle('open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'বন্ধ করুন ✕':'মেনু ☰';});
  }
  nav.querySelectorAll(':scope > .nav-dropdown').forEach(dropdown=>dropdown.addEventListener('toggle',()=>{
    if(dropdown.open)nav.querySelectorAll(':scope > .nav-dropdown').forEach(other=>{if(other!==dropdown)other.open=false;});
  }));
})();