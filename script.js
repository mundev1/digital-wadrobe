// ── DATA ──
  var wardrobe = JSON.parse(localStorage.getItem('dw_items')   || '[]');
  var outfits  = JSON.parse(localStorage.getItem('dw_outfits') || '[]');

  var curFilter  = 'All';
  var bFilter    = 'All';
  var curOutfit  = [];
  var photoData  = null;
  var selColor   = null;

  var COLORS = [
    {name:'White',  hex:'#f5f5f0'}, {name:'Cream',  hex:'#f0e8d0'},
    {name:'Black',  hex:'#222222'}, {name:'Navy',   hex:'#1a2a4a'},
    {name:'Blue',   hex:'#4a7ac8'}, {name:'Sky',    hex:'#87ceeb'},
    {name:'Green',  hex:'#4a8a5a'}, {name:'Olive',  hex:'#7a7a3a'},
    {name:'Red',    hex:'#c84a4a'}, {name:'Pink',   hex:'#f7a8c4'},
    {name:'Purple', hex:'#8a5aaa'}, {name:'Yellow', hex:'#e8c84a'},
    {name:'Orange', hex:'#e87a3a'}, {name:'Brown',  hex:'#7a5a38'},
    {name:'Grey',   hex:'#9a9a9a'}
  ];

  var EMOJI = {
    Tops:'👕', Bottoms:'👖', Outerwear:'🧥',
    Shoes:'👟', Accessories:'👜', Dresses:'👗'
  };

  // ── UTILS ──
  function uid() { return '_' + Math.random().toString(36).slice(2,9); }

  function save() {
    localStorage.setItem('dw_items',   JSON.stringify(wardrobe));
    localStorage.setItem('dw_outfits', JSON.stringify(outfits));
  }

  function toast(msg, icon) {
    document.getElementById('t-msg').textContent  = msg;
    document.getElementById('t-icon').textContent = icon || '✅';
    var el = document.getElementById('toast');
    el.classList.add('show');
    setTimeout(function() { el.classList.remove('show'); }, 2600);
  }

  // ── NAVIGATION ──
  function showView(name, btn) {
    document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('.nav-tab').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('view-' + name).classList.add('active');
    if (btn) btn.classList.add('active');
    if (name === 'wardrobe') renderWardrobe();
    if (name === 'outfits')  renderOutfits();
    if (name === 'builder')  renderBuilder();
    // weather view renders on demand via loadWeather()
  }

  function goBuilder() {
    showView('builder', document.querySelectorAll('.nav-tab')[2]);
  }

  // ── WARDROBE ──
  function setFilter(cat, btn) {
    curFilter = cat;
    document.querySelectorAll('#wfilters .filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderWardrobe();
  }

  function renderWardrobe() {
    var grid = document.getElementById('wardrobe-grid');
    var q = document.getElementById('search-box').value.toLowerCase().trim();

    var items = wardrobe.filter(function(item) {
      var okCat = curFilter === 'All' || item.category === curFilter;
      var okQ   = !q || item.name.toLowerCase().includes(q) || (item.brand||'').toLowerCase().includes(q);
      return okCat && okQ;
    });

    if (items.length === 0) {
      grid.innerHTML = '<div class="empty"><div class="big">🛍️</div><h3>Nothing here yet!</h3><p>Add your first piece above.</p></div>';
      return;
    }

    // Build HTML string for each item
    grid.innerHTML = items.map(function(item, i) {
      var imgHTML = item.photo
        ? '<img class="card-img" src="' + item.photo + '" alt="' + item.name + '">'
        : '<div class="card-img-placeholder">' + EMOJI[item.category] + '</div>';

      var sub = '';
      if (item.color) sub += '<span class="cdot" style="background:' + item.color.hex + '"></span>' + item.color.name;
      if (item.brand) sub += (sub ? ' &nbsp;·&nbsp; ' : '') + item.brand;

      return '<div class="clothing-card" style="animation-delay:' + (i*40) + 'ms">'
        + imgHTML
        + '<div class="card-body">'
        + '<span class="card-cat">' + item.category + '</span>'
        + '<div class="card-name">' + item.name + '</div>'
        + '<div class="card-sub">' + sub + '</div>'
        + '<div class="card-btns">'
        + '<button class="btn btn-sm btn-outline" onclick="quickAdd(\'' + item.id + '\')">+ Outfit</button>'
        + '<button class="btn btn-sm btn-danger" onclick="deleteItem(\'' + item.id + '\')">Delete</button>'
        + '</div>'
        + '</div></div>';
    }).join('');
  }

  function deleteItem(id) {
    wardrobe = wardrobe.filter(function(i) { return i.id !== id; });
    outfits  = outfits.map(function(o) {
      return Object.assign({}, o, { items: o.items.filter(function(x) { return x !== id; }) });
    });
    save();
    renderWardrobe();
    toast('Item deleted', '🗑️');
  }

  function quickAdd(id) {
    if (!curOutfit.includes(id)) curOutfit.push(id);
    toast('Added to outfit builder!', '✨');
    goBuilder();
  }

  // ── MODAL ──
  function openModal() {
    photoData = null;
    document.getElementById('input-name').value  = '';
    document.getElementById('input-brand').value = '';
    document.getElementById('input-cat').value   = 'Tops';

    // Reset upload area
    var area = document.getElementById('upload-area');
    area.classList.remove('has-photo');
    area.innerHTML = '<div class="upload-icon">📷</div>'
      + '<div class="upload-text">Click to upload a photo</div>'
      + '<div class="upload-hint">JPG or PNG</div>'
      + '<div class="upload-hover"><div class="upload-icon">🔄</div><div class="upload-text">Change photo</div></div>';

    // Render color swatches
    selColor = COLORS[0];
    document.getElementById('palette').innerHTML = COLORS.map(function(c, i) {
      return '<div class="swatch ' + (i===0?'active':'') + '" style="background:' + c.hex + '" title="' + c.name + '" onclick="pickColor(' + i + ',this)"></div>';
    }).join('');

    document.getElementById('overlay').classList.add('open');
    setTimeout(function() { document.getElementById('input-name').focus(); }, 220);
  }

  function closeModal() { document.getElementById('overlay').classList.remove('open'); }
  function outsideClick(e) { if (e.target === document.getElementById('overlay')) closeModal(); }

  function pickColor(idx, el) {
    selColor = COLORS[idx];
    document.querySelectorAll('.swatch').forEach(function(s) { s.classList.remove('active'); });
    el.classList.add('active');
  }

  // Convert uploaded file to base64 and show preview
  function handleUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      photoData = e.target.result;
      var area = document.getElementById('upload-area');
      area.classList.add('has-photo');
      area.innerHTML = '<img class="preview-img" src="' + photoData + '">'
        + '<div class="upload-hover"><div class="upload-icon">🔄</div><div class="upload-text">Change photo</div></div>';
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // allow re-picking same file
  }

  function addItem() {
    var name = document.getElementById('input-name').value.trim();
    if (!name) {
      var el = document.getElementById('input-name');
      el.style.borderColor = '#f4a0a0';
      el.focus();
      setTimeout(function() { el.style.borderColor = ''; }, 1200);
      return;
    }

    // Create a new item object
    var newItem = {
      id:       uid(),
      name:     name,
      category: document.getElementById('input-cat').value,
      brand:    document.getElementById('input-brand').value.trim(),
      color:    selColor,
      photo:    photoData,
      added:    Date.now()
    };

    wardrobe.unshift(newItem); // add at top of array
    save();
    closeModal();
    renderWardrobe();
    toast(name + ' added!', '🎉');
  }

  // ── BUILDER ──
  function setBFilter(cat, btn) {
    bFilter = cat;
    document.querySelectorAll('#view-builder .filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderSideList();
  }

  function renderBuilder() {
    renderCanvas();
    renderSideList();
  }

  function renderCanvas() {
    var canvas = document.getElementById('outfit-canvas');
    if (curOutfit.length === 0) {
      canvas.classList.remove('filled');
      canvas.innerHTML = '<div class="canvas-empty"><div class="ce-emoji">👗</div><p>Select items from the panel on the right!</p></div>';
      return;
    }
    canvas.classList.add('filled');
    canvas.innerHTML = curOutfit.map(function(id) {
      var item = wardrobe.find(function(w) { return w.id === id; });
      if (!item) return '';
      var thumbHTML = item.photo
        ? '<img src="' + item.photo + '" style="width:80px;height:80px;object-fit:cover;border-radius:9px">'
        : '<div class="piece-emoji">' + EMOJI[item.category] + '</div>';
      return '<div class="piece">'
        + '<button class="rm-btn" onclick="removeFromOutfit(\'' + id + '\')">×</button>'
        + thumbHTML
        + '<div class="piece-name">' + item.name + '</div>'
        + '<div class="piece-cat">'  + item.category + '</div>'
        + '</div>';
    }).join('');
  }

  function renderSideList() {
    var list = document.getElementById('side-list');
    var items = wardrobe.filter(function(i) { return bFilter === 'All' || i.category === bFilter; });

    if (items.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">No items yet! Add some in the Wardrobe tab.</div>';
      return;
    }

    list.innerHTML = items.map(function(item) {
      var isIn = curOutfit.includes(item.id);
      var thumbHTML = item.photo
        ? '<div class="side-thumb"><img src="' + item.photo + '"></div>'
        : '<div class="side-thumb">' + EMOJI[item.category] + '</div>';
      return '<div class="side-item ' + (isIn ? 'in' : '') + '" onclick="toggleItem(\'' + item.id + '\')">'
        + thumbHTML
        + '<div class="side-info">'
        + '<div class="side-name">' + item.name + '</div>'
        + '<div class="side-cat">'  + item.category + '</div>'
        + '</div>'
        + '<div class="check-badge">✓</div>'
        + '</div>';
    }).join('');
  }

  function toggleItem(id) {
    if (curOutfit.includes(id)) {
      curOutfit = curOutfit.filter(function(x) { return x !== id; });
    } else {
      curOutfit.push(id);
    }
    renderCanvas();
    renderSideList();
  }

  function removeFromOutfit(id) {
    curOutfit = curOutfit.filter(function(x) { return x !== id; });
    renderCanvas();
    renderSideList();
  }

  function clearCanvas() {
    curOutfit = [];
    document.getElementById('outfit-name').value = '';
    renderCanvas();
    renderSideList();
  }

  function saveOutfit() {
    if (curOutfit.length === 0) { toast('Add at least one piece!', '⚠️'); return; }
    var name = document.getElementById('outfit-name').value.trim() || 'My Outfit';
    outfits.unshift({ id: uid(), name: name, items: curOutfit.slice(), created: Date.now() });
    save();
    clearCanvas();
    toast('"' + name + '" saved!', '🎉');
    showView('outfits', document.querySelectorAll('.nav-tab')[1]);
  }

  // ── OUTFITS ──
  function renderOutfits() {
    var grid = document.getElementById('outfits-grid');
    if (outfits.length === 0) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="big">✨</div><h3>No outfits yet!</h3><p>Use the Builder to create your first look.</p></div>';
      return;
    }
    grid.innerHTML = outfits.map(function(outfit, i) {
      var pieces = outfit.items.map(function(id) { return wardrobe.find(function(w) { return w.id === id; }); }).filter(Boolean);

      var cells = pieces.slice(0, 4).map(function(p, idx) {
        var spanClass = (pieces.length === 1 || (pieces.length === 3 && idx === 0)) ? ' span2' : '';
        var content = p.photo ? '<img src="' + p.photo + '">' : EMOJI[p.category];
        return '<div class="oc-cell' + spanClass + '">' + content + '</div>';
      }).join('');

      return '<div class="outfit-card" style="animation-delay:' + (i*60) + 'ms">'
        + '<div class="oc-preview">' + cells + '</div>'
        + '<div class="oc-body">'
        + '<div class="oc-name">' + outfit.name + '</div>'
        + '<div class="oc-count">' + pieces.length + ' piece' + (pieces.length!==1?'s':'') + '</div>'
        + '<div class="oc-btns">'
        + '<button class="btn btn-sm btn-outline" onclick="loadOutfit(\'' + outfit.id + '\')">✏️ Edit</button>'
        + '<button class="btn btn-sm btn-danger" onclick="deleteOutfit(\'' + outfit.id + '\')">Delete</button>'
        + '</div></div></div>';
    }).join('');
  }

  function loadOutfit(id) {
    var o = outfits.find(function(x) { return x.id === id; });
    if (!o) return;
    curOutfit = o.items.slice();
    document.getElementById('outfit-name').value = o.name;
    goBuilder();
  }

  function deleteOutfit(id) {
    outfits = outfits.filter(function(o) { return o.id !== id; });
    save();
    renderOutfits();
    toast('Outfit deleted', '🗑️');
  }

  // ── KEYBOARD ──
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('overlay').classList.contains('open')) addItem();
  });


  // ── WEATHER ──────────────────────────────────────────────

  var WEATHER_API_KEY = '745abaf22fd4ea383ad2c910934a04b4';
  var lastWeatherData = null;

  /*
   * Weather condition codes from OpenWeatherMap:
   * 2xx = Thunderstorm, 3xx = Drizzle, 5xx = Rain,
   * 6xx = Snow, 7xx = Atmosphere (fog/mist), 800 = Clear, 8xx = Clouds
   */

  // Maps a weather condition code + temp to a "profile" used for suggestions
  function getWeatherProfile(conditionCode, tempC) {
    var profile = {
      condition: '',   // sunny / cloudy / rainy / snowy / foggy / stormy
      tempBand:  '',   // hot / warm / mild / cool / cold
      tags:      [],   // labels shown in the UI
      reason:    '',   // sentence explaining the suggestion
      categories: []   // which clothing categories to prioritise
    };

    // Temperature band
    if (tempC >= 30) {
      profile.tempBand = 'hot';
      profile.tags.push({ label: '🔥 Hot (' + Math.round(tempC) + '°C)', cls: 'hot' });
      profile.categories = ['Tops', 'Dresses', 'Bottoms', 'Shoes', 'Accessories'];
    } else if (tempC >= 22) {
      profile.tempBand = 'warm';
      profile.tags.push({ label: '☀️ Warm (' + Math.round(tempC) + '°C)', cls: 'warm' });
      profile.categories = ['Tops', 'Dresses', 'Bottoms', 'Shoes', 'Accessories'];
    } else if (tempC >= 15) {
      profile.tempBand = 'mild';
      profile.tags.push({ label: '🌤️ Mild (' + Math.round(tempC) + '°C)', cls: 'warm' });
      profile.categories = ['Tops', 'Outerwear', 'Bottoms', 'Shoes', 'Accessories'];
    } else if (tempC >= 8) {
      profile.tempBand = 'cool';
      profile.tags.push({ label: '🧥 Cool (' + Math.round(tempC) + '°C)', cls: 'cool' });
      profile.categories = ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
    } else {
      profile.tempBand = 'cold';
      profile.tags.push({ label: '🥶 Cold (' + Math.round(tempC) + '°C)', cls: 'cold' });
      profile.categories = ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
    }

    // Condition
    if (conditionCode >= 200 && conditionCode < 300) {
      profile.condition = 'stormy';
      profile.tags.push({ label: '⛈️ Thunderstorm', cls: 'rainy' });
    } else if (conditionCode >= 300 && conditionCode < 600) {
      profile.condition = 'rainy';
      profile.tags.push({ label: '🌧️ Rainy', cls: 'rainy' });
    } else if (conditionCode >= 600 && conditionCode < 700) {
      profile.condition = 'snowy';
      profile.tags.push({ label: '❄️ Snowy', cls: 'cold' });
    } else if (conditionCode >= 700 && conditionCode < 800) {
      profile.condition = 'foggy';
      profile.tags.push({ label: '🌫️ Foggy', cls: 'cool' });
    } else if (conditionCode === 800) {
      profile.condition = 'sunny';
      profile.tags.push({ label: '☀️ Clear Sky', cls: 'warm' });
    } else {
      profile.condition = 'cloudy';
      profile.tags.push({ label: '☁️ Cloudy', cls: 'cool' });
    }

    // Build reason text
    var reasonMap = {
      'hot-sunny':   'It\'s hot and sunny — go light! Breathable tops and dresses are ideal.',
      'hot-cloudy':  'It\'s warm despite the clouds — light layers work great.',
      'warm-sunny':  'Perfect weather — a nice top or dress will do the job.',
      'warm-cloudy': 'Comfortable temperature — a light outfit with an optional layer.',
      'mild-sunny':  'Pleasant out there — a light jacket over your top is a great call.',
      'mild-cloudy': 'A bit overcast — keep a light jacket handy just in case.',
      'cool-rainy':  'Cool and rainy — grab your outerwear and something waterproof.',
      'cool-cloudy': 'Cool and grey — layer up with a jacket or coat.',
      'cold-snowy':  'Freezing out there — bundle up with your warmest layers!',
      'cold-cloudy': 'Cold day ahead — your thickest coat and warm layers are essential.',
    };
    var key = profile.tempBand + '-' + profile.condition;
    profile.reason = reasonMap[key] || 'Dress for ' + Math.round(tempC) + '°C — check your wardrobe for suitable pieces.';

    return profile;
  }

  // Returns a weather emoji for a given condition code
  function getWeatherEmoji(code) {
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 400) return '🌦️';
    if (code >= 500 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800)               return '☀️';
    if (code === 801)               return '🌤️';
    if (code === 802)               return '⛅';
    return '🌥️';
  }

  // Pick items from wardrobe that suit the weather profile
  function getSuggestedItems(profile) {
    var suggested = [];

    // Go through priority category order and pick up to 2 items per category
    for (var c = 0; c < profile.categories.length; c++) {
      var cat = profile.categories[c];
      var catItems = wardrobe.filter(function(item) { return item.category === cat; });

      // For cold/cool weather prioritise outerwear; for hot skip outerwear
      if (profile.tempBand === 'hot' && cat === 'Outerwear') continue;
      if ((profile.tempBand === 'cold' || profile.tempBand === 'cool') && cat === 'Dresses') continue;

      // Add up to 2 items from this category
      for (var i = 0; i < catItems.length && i < 2; i++) {
        suggested.push(catItems[i]);
      }

      // Cap total at 8 items
      if (suggested.length >= 8) break;
    }

    return suggested;
  }

  function loadWeather() {
    var city = document.getElementById('city-input').value.trim();
    if (!city) {
      document.getElementById('city-input').style.borderColor = '#f4a0a0';
      document.getElementById('city-input').focus();
      setTimeout(function() { document.getElementById('city-input').style.borderColor = ''; }, 1200);
      return;
    }

    // Show loading, hide everything else
    document.getElementById('weather-idle').style.display    = 'none';
    document.getElementById('weather-card').style.display    = 'none';
    document.getElementById('weather-error').style.display   = 'none';
    document.getElementById('weather-loading').style.display = 'block';

    // Call OpenWeatherMap API
    // Note: new API keys can take up to 2 hours to activate after registration
    var url = 'https://api.openweathermap.org/data/2.5/weather'
      + '?q=' + encodeURIComponent(city)
      + '&appid=' + WEATHER_API_KEY
      + '&units=metric';   // metric = Celsius

    fetch(url)
      .then(function(res) {
        // Read response as JSON regardless — error responses also contain useful info
        return res.json().then(function(data) {
          if (!res.ok) {
            // API returned an error — use the message from the API itself
            var msg = data.message || 'Unknown error';
            var code = data.cod || res.status;
            throw new Error(code + ': ' + msg);
          }
          return data;
        });
      })
      .then(function(data) {
        document.getElementById('weather-loading').style.display = 'none';
        renderWeather(data);
      })
      .catch(function(err) {
        document.getElementById('weather-loading').style.display = 'none';
        document.getElementById('weather-error').style.display   = 'block';

        var msg = err.message || '';
        var displayMsg = '';

        if (msg.indexOf('401') !== -1 || msg.indexOf('Invalid API key') !== -1) {
          displayMsg = '⚠️ API key not active yet. New OpenWeatherMap keys take up to 2 hours to activate. Please try again later.';
        } else if (msg.indexOf('404') !== -1 || msg.indexOf('city not found') !== -1) {
          displayMsg = 'City "' + city + '" not found. Try a bigger nearby city or check the spelling.';
        } else if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
          displayMsg = 'Network error — check your internet connection and try again.';
        } else {
          displayMsg = 'Error: ' + msg + '. If your key is new, wait 2 hours and try again.';
        }

        document.getElementById('weather-error-msg').textContent = displayMsg;
      });
  }

  function renderWeather(data) {
    lastWeatherData = data;

    var tempC       = data.main.temp;
    var feelsLike   = data.main.feels_like;
    var humidity    = data.main.humidity;
    var windSpeed   = Math.round(data.wind.speed * 3.6); // m/s → km/h
    var condCode    = data.weather[0].id;
    var condDesc    = data.weather[0].description;
    var cityName    = data.name + ', ' + data.sys.country;

    // Fill in the weather info panel
    document.getElementById('w-icon').textContent    = getWeatherEmoji(condCode);
    document.getElementById('w-temp').textContent    = Math.round(tempC) + '°C';
    document.getElementById('w-desc').textContent    = condDesc;
    document.getElementById('w-city').textContent    = cityName;
    document.getElementById('w-humidity').textContent = humidity + '%';
    document.getElementById('w-wind').textContent    = windSpeed + ' km/h';
    document.getElementById('w-feels').textContent   = 'Feels ' + Math.round(feelsLike) + '°C';

    // Get the weather profile and suggestions
    var profile  = getWeatherProfile(condCode, tempC);
    var items    = getSuggestedItems(profile);

    document.getElementById('w-label').textContent    = 'Today\'s Recommended Look';
    document.getElementById('w-subtitle').textContent = 'Based on conditions in ' + data.name;

    // Render suggestion tags
    document.getElementById('w-tags').innerHTML = profile.tags.map(function(t) {
      return '<span class="stag ' + t.cls + '">' + t.label + '</span>';
    }).join('');

    // Render suggested clothing cards
    var grid = document.getElementById('suggestion-grid');
    var noSug = document.getElementById('no-suggestions');

    if (items.length === 0) {
      grid.style.display  = 'none';
      noSug.style.display = 'block';
    } else {
      noSug.style.display = 'none';
      grid.style.display  = 'grid';
      grid.innerHTML = items.map(function(item, i) {
        var imgHTML = item.photo
          ? '<img class="sug-img" src="' + item.photo + '" alt="' + item.name + '">'
          : '<div class="sug-placeholder">' + EMOJI[item.category] + '</div>';
        return '<div class="sug-card" style="animation-delay:' + (i * 50) + 'ms">'
          + imgHTML
          + '<div class="sug-info">'
          + '<div class="sug-name">' + item.name + '</div>'
          + '<div class="sug-cat">' + item.category + '</div>'
          + '</div></div>';
      }).join('');
    }

    // Append the reason banner inside the right panel
    var right = document.querySelector('.weather-right');
    var existingReason = right.querySelector('.weather-reason');
    if (existingReason) existingReason.remove();
    var reasonEl = document.createElement('div');
    reasonEl.className = 'weather-reason';
    reasonEl.innerHTML = '<strong>Why these?</strong> ' + profile.reason;
    right.appendChild(reasonEl);

    document.getElementById('weather-card').style.display = 'grid';
  }

  // Allow pressing Enter in city input
  document.getElementById('city-input') && document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement === document.getElementById('city-input')) {
      loadWeather();
    }
  });


  renderWardrobe();