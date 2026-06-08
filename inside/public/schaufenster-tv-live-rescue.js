(function () {
  'use strict'

  var rescueDelayMs = 4500
  var slideDurationMs = 10000
  var rotationTimer = null
  var items = []
  var currentIndex = 0

  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]'
  }

  function text(value, fallback) {
    var normalized = value === null || value === undefined ? '' : String(value)
    normalized = normalized.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')
    return normalized || (fallback || '')
  }

  function isMissingMetric(value) {
    var normalized = text(value).toLowerCase()
    return normalized === '' || normalized === 'k. a.' || normalized === 'k.a.' || normalized === 'undefined'
  }

  function itemImages(item) {
    if (item && isArray(item.gallery_images) && item.gallery_images.length > 0) {
      return item.gallery_images
    }
    if (item && item.image_url) {
      return [item.image_url]
    }
    return []
  }

  function titleClass(title) {
    var length = text(title).length
    if (length > 118) return 'tv-title tv-title-long'
    if (length > 78) return 'tv-title tv-title-medium'
    return 'tv-title'
  }

  function element(tagName, className, textContent) {
    var node = document.createElement(tagName)
    if (className) node.className = className
    if (textContent !== undefined && textContent !== null) node.textContent = textContent
    return node
  }

  function appendMetric(parent, metric) {
    if (!metric || isMissingMetric(metric.value)) return
    var node = element('div')
    node.appendChild(element('span', '', text(metric.label)))
    node.appendChild(element('strong', '', text(metric.value)))
    parent.appendChild(node)
  }

  function energySummary(metrics) {
    if (!isArray(metrics)) return null
    var energyClass = null
    var energyValue = null
    var index
    for (index = 0; index < metrics.length; index += 1) {
      if (text(metrics[index].label).toLowerCase() === 'klasse') {
        energyClass = metrics[index]
      }
      if (text(metrics[index].label).toLowerCase() === 'kennwert') {
        energyValue = metrics[index]
      }
    }
    if (!energyClass || isMissingMetric(energyClass.value)) return null
    return {
      classValue: text(energyClass.value),
      value: energyValue && !isMissingMetric(energyValue.value) ? text(energyValue.value) : '',
    }
  }

  function ensureHeaderStyle() {
    if (document.getElementById('frisia-tv-rescue-style')) return
    var style = document.createElement('style')
    style.id = 'frisia-tv-rescue-style'
    style.textContent =
      '.tv-board-header{background:#1b3040!important;border:0!important;display:block!important;height:8px!important;padding:0!important}.tv-board-header>*{display:none!important}'
    document.head.appendChild(style)
  }

  function buildSlide(item) {
    var isProperty = item.type === 'property'
    var galleryImages = itemImages(item)
    var mainImage = galleryImages[0] || item.image_url || ''
    var section = element('section', 'tv-slide')
    var board = element('div', 'tv-board')
    var header = element('header', 'tv-board-header')
    var content = element('div', 'tv-board-content')
    var imagePane = element('div', 'tv-image-pane')
    var photoGrid = element('div', 'tv-photo-grid')
    var imageFrame = element('div', 'tv-image-frame tv-main-frame')
    var image = document.createElement('img')
    var vignette = element('div', 'tv-image-vignette')
    var infoPane = element('aside', 'tv-info-pane')
    var infoMain = element('div', 'tv-info-main')
    var location = text(item.location || item.city, 'Frisia Immobilien')
    var title = text(item.title, 'Frisia Immobilien')
    var footer = element('footer', 'tv-board-footer')

    image.className = 'tv-main-image'
    image.alt = ''
    image.decoding = 'async'
    image.src = mainImage
    imageFrame.appendChild(image)
    photoGrid.appendChild(imageFrame)
    imagePane.appendChild(photoGrid)
    imagePane.appendChild(vignette)

    infoMain.appendChild(element('p', 'tv-location', location))
    infoMain.appendChild(element('h1', titleClass(title), title))
    if (item.subtitle) infoMain.appendChild(element('p', 'tv-subtitle', text(item.subtitle)))

    if (isProperty) {
      var price = element('div', 'tv-price')
      var metrics = element('div', 'tv-metrics')
      var metricItems = isArray(item.metrics) ? item.metrics : []
      var energy = energySummary(item.energy_metrics)
      var index

      infoMain.appendChild(element('div', 'tv-divider'))
      price.appendChild(element('span', '', text(item.price_label, 'Preis')))
      price.appendChild(element('strong', '', text(item.price_text, 'Preis auf Anfrage')))
      infoMain.appendChild(price)

      for (index = 0; index < metricItems.length && metrics.childNodes.length < 4; index += 1) {
        appendMetric(metrics, metricItems[index])
      }
      infoMain.appendChild(metrics)

      if (energy) {
        var energyBlock = element('div', 'tv-energy-block')
        energyBlock.appendChild(element('strong', '', 'Energieklasse ' + energy.classValue))
        if (energy.value) energyBlock.appendChild(element('span', '', energy.value))
        infoMain.appendChild(energyBlock)
      }
    } else {
      infoMain.appendChild(element('p', 'tv-custom-copy', 'Regional. Persoenlich. Frisia Immobilien.'))
    }

    infoPane.appendChild(infoMain)
    infoPane.appendChild(buildContactCorner(item, isProperty))
    content.appendChild(imagePane)
    content.appendChild(infoPane)

    footer.appendChild(element('span', '', 'Frisia Immobilien'))
    footer.appendChild(element('span', '', 'Aurich · Ostfriesland'))

    board.appendChild(header)
    board.appendChild(content)
    board.appendChild(footer)
    section.appendChild(board)
    return section
  }

  function buildContactCorner(item, isProperty) {
    var corner = element('div', 'tv-info-corner')
    var logo = document.createElement('img')
    var details = element('div', 'tv-contact-details')
    var brokerCard = element('div', 'tv-broker-card')
    var broker = isProperty ? item.broker : null
    var brokerText = element('div')

    logo.className = 'tv-contact-logo'
    logo.src = '/logo.svg'
    logo.alt = 'Frisia Immobilien'
    corner.appendChild(logo)

    if (broker && broker.image_url) {
      var brokerImage = document.createElement('img')
      brokerImage.src = broker.image_url
      brokerImage.alt = ''
      brokerCard.appendChild(brokerImage)
    } else if (!broker) {
      brokerCard.className = 'tv-broker-card tv-broker-card-fallback'
    }

    brokerText.appendChild(element('span', '', 'Ihr Ansprechpartner'))
    brokerText.appendChild(element('strong', '', broker ? text(broker.name, 'Frisia Immobilien') : 'Frisia Immobilien'))
    if (broker && broker.position) brokerText.appendChild(element('small', '', text(broker.position)))
    brokerCard.appendChild(brokerText)
    details.appendChild(brokerCard)
    details.appendChild(element('p', 'tv-contact-phone', broker && broker.phone ? text(broker.phone) : '04941 986770-0'))
    details.appendChild(element('p', 'tv-contact-website', 'frisia-immobilien.de'))
    corner.appendChild(details)
    return corner
  }

  function renderCurrentItem() {
    var screen = document.querySelector('.tv-screen')
    if (!screen || !items.length) return

    if (screen.getAttribute('data-tv-rescue') !== '1' && screen.querySelector('.tv-slide')) {
      if (rotationTimer) window.clearInterval(rotationTimer)
      return
    }

    ensureHeaderStyle()
    screen.setAttribute('data-tv-rescue', '1')
    while (screen.firstChild) screen.removeChild(screen.firstChild)
    screen.appendChild(buildSlide(items[currentIndex]))
  }

  function startRotation(nextItems) {
    items = nextItems
    currentIndex = 0
    renderCurrentItem()
    if (rotationTimer) window.clearInterval(rotationTimer)
    if (items.length > 1) {
      rotationTimer = window.setInterval(function () {
        currentIndex = (currentIndex + 1) % items.length
        renderCurrentItem()
      }, slideDurationMs)
    }
  }

  function loadItems() {
    var screen = document.querySelector('.tv-screen')
    if (!screen || screen.querySelector('.tv-slide')) return

    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/api/schaufenster/items.php?rescue=' + new Date().getTime(), true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return
      if (xhr.status < 200 || xhr.status >= 300) return
      try {
        var payload = JSON.parse(xhr.responseText)
        var nextItems = payload && payload.ok && payload.data && isArray(payload.data.items) ? payload.data.items : []
        var usable = []
        var index
        for (index = 0; index < nextItems.length; index += 1) {
          if (itemImages(nextItems[index]).length > 0) usable.push(nextItems[index])
        }
        if (usable.length > 0) startRotation(usable)
      } catch (error) {
        return
      }
    }
    xhr.send(null)
  }

  window.setTimeout(loadItems, rescueDelayMs)
})()
