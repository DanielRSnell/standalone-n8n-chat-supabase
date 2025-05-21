<?php
/**
 * GutenVibes Chat Widget Template
 *
 * This template renders the GutenVibes chat widget as a web component.
 * The web component is registered in the JavaScript bundle loaded separately.
 */

// Get settings that might be needed as attributes
$start_open = carbon_get_theme_option('gv_start_open') === 'yes' ? 'true' : 'false';
$mode = esc_attr(carbon_get_theme_option('gv_mode') ?: 'drawer');

// Render the web component with attributes
?>
<guten-vibes
  style="z-index: 99999999999999;"
  config-id="agent-config"
  mode="<?php echo $mode; ?>"
  start-open="<?php echo $start_open; ?>"
></guten-vibes>
