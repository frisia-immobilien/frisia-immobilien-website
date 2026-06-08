<?php

declare(strict_types=1);

require dirname(__DIR__) . '/api/bootstrap.php';
require dirname(__DIR__) . '/api/lib/schaufenster.php';

function tv_h(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function tv_missing_metric(string $value): bool
{
    $normalized = mb_strtolower(trim($value), 'UTF-8');
    return in_array($normalized, ['', 'k. a.', 'k.a.', 'undefined'], true);
}

function tv_title_class(string $title): string
{
    $length = mb_strlen($title, 'UTF-8');
    if ($length > 112) {
        return 'tv-title tv-title-long';
    }
    if ($length > 72) {
        return 'tv-title tv-title-medium';
    }
    if ($length <= 46) {
        return 'tv-title tv-title-short';
    }
    return 'tv-title';
}

function tv_item_images(array $item): array
{
    if (!empty($item['gallery_images']) && is_array($item['gallery_images'])) {
        return array_values(array_filter($item['gallery_images']));
    }
    return !empty($item['image_url']) ? [(string) $item['image_url']] : [];
}

function tv_energy_summary(array $metrics): ?array
{
    $class = null;
    $value = null;
    foreach ($metrics as $metric) {
        if (!is_array($metric)) {
            continue;
        }
        $label = mb_strtolower(trim((string) ($metric['label'] ?? '')), 'UTF-8');
        if ($label === 'klasse') {
            $class = trim((string) ($metric['value'] ?? ''));
        }
        if ($label === 'kennwert') {
            $value = trim((string) ($metric['value'] ?? ''));
        }
    }
    if (!$class || tv_missing_metric($class)) {
        return null;
    }
    return [
        'class' => $class,
        'value' => $value && !tv_missing_metric($value) ? $value : null,
    ];
}

function tv_load_items(): array
{
    $pdo = require_db();
    $propertyStmt = $pdo->query(
        'SELECT *
         FROM schaufenster_tv_properties
         WHERE active = 1
           AND image_url IS NOT NULL
           AND image_url <> ""
           AND city IS NOT NULL
           AND city <> ""
           AND price_amount IS NOT NULL
           AND price_amount > 0
           AND price_on_inquiry = 0
         ORDER BY synced_at DESC, title ASC
         LIMIT 80'
    );
    $properties = array_map('st_map_property_row', $propertyStmt->fetchAll());

    $slideStmt = $pdo->query(
        'SELECT *
         FROM schaufenster_tv_slides
         WHERE active = 1
         ORDER BY sort_order ASC, created_at DESC
         LIMIT 80'
    );
    $slides = array_map('st_map_slide_row', $slideStmt->fetchAll());

    $items = array_values(array_filter([...$properties, ...$slides], static fn (array $item): bool => tv_item_images($item) !== []));
    shuffle($items);
    return $items;
}

try {
    $items = tv_load_items();
} catch (Throwable $error) {
    $items = [];
}

$item = $items[0] ?? null;
$isProperty = is_array($item) && ($item['type'] ?? '') === 'property';
$images = is_array($item) ? tv_item_images($item) : [];
$mainImage = $images[0] ?? '';
$title = is_array($item) ? trim((string) ($item['title'] ?? 'Frisia Immobilien')) : 'Frisia Immobilien';
$location = is_array($item)
    ? trim((string) (($item['location'] ?? '') ?: ($item['city'] ?? '') ?: 'Frisia Immobilien'))
    : 'Frisia Immobilien';
$metrics = is_array($item['metrics'] ?? null) ? $item['metrics'] : [];
$energy = tv_energy_summary(is_array($item['energy_metrics'] ?? null) ? $item['energy_metrics'] : []);
$broker = is_array($item['broker'] ?? null) ? $item['broker'] : null;
$contactPhone = trim((string) ($broker['phone'] ?? '')) ?: '04941 986770-0';
$refreshSeconds = 30;
$refreshUrl = '/schaufenster-tv/live/?refresh=' . (time() + $refreshSeconds);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Refresh: ' . $refreshSeconds . '; url=' . $refreshUrl);
?><!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1280, height=720, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="<?= (int) $refreshSeconds ?>; url=<?= tv_h($refreshUrl) ?>">
  <title>Schaufenster TV | Frisia Inside</title>
  <style>
<?php readfile(dirname(__DIR__) . '/schaufenster-tv-live-standalone.css'); ?>
  </style>
</head>
<body>
<?php if ($item && $mainImage): ?>
  <main id="tv-screen" class="tv-screen">
    <section class="tv-slide">
      <div class="tv-board">
        <header class="tv-board-header" aria-hidden="true"></header>
        <div class="tv-board-content">
          <div class="tv-image-pane">
            <div class="tv-photo-grid">
              <div class="tv-image-frame tv-main-frame">
                <div class="tv-main-image-bg" style="background-image: url('<?= tv_h($mainImage) ?>');"></div>
                <img class="tv-main-image" src="<?= tv_h($mainImage) ?>" alt="">
              </div>
            </div>
            <div class="tv-image-vignette"></div>
          </div>
          <aside class="tv-info-pane">
            <div class="tv-info-main">
              <p class="tv-location"><?= tv_h($location) ?></p>
              <h1 class="<?= tv_h(tv_title_class($title)) ?>"><?= tv_h($title) ?></h1>
              <?php if (!empty($item['subtitle'])): ?>
                <p class="tv-subtitle"><?= tv_h($item['subtitle']) ?></p>
              <?php endif; ?>

              <?php if ($isProperty): ?>
                <div class="tv-divider"></div>
                <div class="tv-price">
                  <span><?= tv_h($item['price_label'] ?? 'Preis') ?></span>
                  <strong><?= tv_h($item['price_text'] ?? 'Preis auf Anfrage') ?></strong>
                </div>
                <div class="tv-metrics">
                  <?php
                  $visibleMetrics = 0;
                  foreach ($metrics as $metric):
                      if (!is_array($metric) || tv_missing_metric((string) ($metric['value'] ?? '')) || $visibleMetrics >= 4) {
                          continue;
                      }
                      $visibleMetrics++;
                  ?>
                    <div>
                      <span><?= tv_h($metric['label'] ?? '') ?></span>
                      <strong><?= tv_h($metric['value'] ?? '') ?></strong>
                    </div>
                  <?php endforeach; ?>
                </div>
                <?php if ($energy): ?>
                  <div class="tv-energy-block">
                    <strong>Energieklasse <?= tv_h($energy['class']) ?></strong>
                    <?php if (!empty($energy['value'])): ?>
                      <span><?= tv_h($energy['value']) ?></span>
                    <?php endif; ?>
                  </div>
                <?php endif; ?>
              <?php else: ?>
                <p class="tv-custom-copy">Regional. Persoenlich. Frisia Immobilien.</p>
              <?php endif; ?>
            </div>

            <div class="tv-info-corner">
              <img class="tv-contact-logo" src="/logo.svg" alt="Frisia Immobilien">
              <div class="tv-contact-details">
                <?php if ($isProperty && $broker): ?>
                  <div class="tv-broker-card">
                    <?php if (!empty($broker['image_url'])): ?>
                      <img src="<?= tv_h($broker['image_url']) ?>" alt="">
                    <?php endif; ?>
                    <div>
                      <span>Ihr Ansprechpartner</span>
                      <strong><?= tv_h($broker['name'] ?? 'Frisia Immobilien') ?></strong>
                      <?php if (!empty($broker['position'])): ?>
                        <small><?= tv_h($broker['position']) ?></small>
                      <?php endif; ?>
                    </div>
                  </div>
                <?php else: ?>
                  <div class="tv-broker-card tv-broker-card-fallback">
                    <div>
                      <span>Ihr Ansprechpartner</span>
                      <strong>Frisia Immobilien</strong>
                    </div>
                  </div>
                <?php endif; ?>
                <p class="tv-contact-phone"><?= tv_h($contactPhone) ?></p>
                <p class="tv-contact-website">frisia-immobilien.de</p>
              </div>
            </div>
          </aside>
        </div>
        <footer class="tv-board-footer">
          <span>Frisia Immobilien</span>
          <span>Aurich · Ostfriesland</span>
        </footer>
      </div>
    </section>
  </main>
<?php else: ?>
  <main id="tv-screen" class="tv-screen">
    <section class="tv-brand-slide">
      <div class="tv-brand-mark"><img src="/logo.svg" alt="Frisia Immobilien"></div>
      <p>Immobilienverkauf in Aurich und Ostfriesland</p>
      <h1>Frisia Immobilien</h1>
      <strong>Fundierte Bewertung. Klare Preisstrategie. Strukturierter Verkaufsprozess.</strong>
      <span>04941 986770-0 · frisia-immobilien.de</span>
    </section>
  </main>
<?php endif; ?>
<script>
(function () {
  var target = <?= json_encode($refreshUrl, JSON_UNESCAPED_SLASHES) ?>;
  window.setTimeout(function () {
    window.location.replace(target);
  }, <?= (int) $refreshSeconds * 1000 ?>);
}());
</script>
</body>
</html>
