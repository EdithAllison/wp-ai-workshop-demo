# Workshop: Restoring Full Plugin Functionality

This document lists all the code that was removed from the plugin and where to add it back to restore full functionality. Each section corresponds to a `TODO` comment in the codebase.

---

## 1. AI Content Generation

**File:** `includes/content.php`

Replace the body of `wp_ai_workshop_generate_content()` with:

```php
function wp_ai_workshop_generate_content( $prompt ) {
	$prompt = rtrim( $prompt );
	if ( ! str_ends_with( $prompt, '.' ) ) {
		$prompt .= '.';
	}
	$prompt .= ' Make sure the response uses valid WordPress Block Editor markup.';
	try {
		$text = wp_ai_client_prompt( $prompt )
			->generate_text();
		return $text;
	} catch ( Exception $e ) {
		return new WP_Error( 'content_creation_error', 'Error message', $e->getMessage() );
	}
}
```

---

## 2. AI Image Generation

**File:** `includes/image.php`

Replace the body of `wp_ai_workshop_demo_create_image()` with:

```php
function wp_ai_workshop_demo_create_image( $title ) {
	$prompt = 'Create a relevant featured image for a blog post with the following title: ' . $title . '.';
	$image_builder = wp_ai_client_prompt( $prompt );
    if ( ! $image_builder->is_supported_for_image_generation() ){
        return null;
    }
    try {
        return $image_builder->generate_image();
    }catch ( Exception $e ) {
        return new WP_Error( 'image_creation_error', 'Error message', $e->getMessage() );
    }
}
```

---

## 3. Ability Registration

**File:** `includes/abilities.php`

Replace the body of `wp_ai_workshop_demo_register_ability_categories()` with:

```php
function wp_ai_workshop_demo_register_ability_categories() {
	wp_register_ability_category(
		'wp-ai-workshop-demo',
		array(
			'label'       => __( 'WP AI Workshop Demo', 'wp-ai-workshop-demo' ),
			'description' => __( 'Abilities for the WP AI Workshop Demo.', 'wp-ai-workshop-demo' ),
		)
	);
}
```

Replace the body of `wp_ai_workshop_demo_register_generate_post_ability()` with:

```php
function wp_ai_workshop_demo_register_generate_post_ability() {
	wp_register_ability(
		'wp-ai-workshop-demo/generate-post',
		array(
			'label'               => __( 'Generate a post via AI', 'wp-ai-workshop-demo' ),
			'description'         => __( 'Based on a title and prompt, create an AI generated WordPress post.', 'wp-ai-workshop-demo' ),
			'category'            => 'wp-ai-workshop-demo',
			'input_schema'        => array(
				'type'       => 'object',
				'properties' => array(
					'title'  => array(
						'type'        => 'string',
						'description' => 'The title of the post to be generated.',
					),
					'prompt'  => array(
						'type'        => 'string',
						'description' => 'The prompt to guide the post generation.',
					),
				),
			),
			'output_schema'       => array(
				'type'       => 'object',
				'properties' => array(
					'message' => array(
						'type'        => 'string',
						'description' => 'A status message if the post was created successfully or not.',
					),
					'post_id' => array(
						'type'        => 'integer',
						'description' => 'The ID of the newly created post.',
					),
				),
				'required'   => array( 'message' ),
			),
			'execute_callback'    => 'wp_ai_workshop_demo_generate_post',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta'                => array(
				'show_in_rest' => true,
			),
		)
	);
}
```

---

## 4. Ability Hook Registration

**File:** `wp-ai-workshop-demo.php`

Replace the `// TODO: Register ability category and generate post ability hooks.` comment with:

```php
add_action( 'wp_abilities_api_categories_init', 'wp_ai_workshop_demo_register_ability_categories' );
add_action( 'wp_abilities_api_init', 'wp_ai_workshop_demo_register_generate_post_ability' );
```

---

## 5. Enqueue Abilities Scripts

**File:** `includes/admin.php`

Replace the `// TODO: Enqueue the wp-ai-client and abilities scripts.` comment with:

```php
    wp_enqueue_script( 'wp-ai-client' );

    // Should be removed once 7.0 is released.
    wp_enqueue_script_module( '@wordpress/core-abilities' );
    wp_enqueue_script_module( '@wordpress/abilities' );
```

Also update the `wp_enqueue_script_module` call for `wp-ai-workshop-demo-script` to include the `@wordpress/abilities` dependency:

```php
    wp_enqueue_script_module(
        'wp-ai-workshop-demo-script',
        plugins_url( 'build/index.js', __DIR__ ),
        array( '@wordpress/abilities' ),
        $asset_file['version'],
    );
```

---

## 6. Settings Page — Abilities and AI Welcome Message

**File:** `src/components/settings-page.jsx`

### 6a. Add the Abilities import

Add `useEffect` back to the imports:

```js
import { useState, useEffect, useCallback } from "@wordpress/element";
```

Add this import after the `DataForm` import:

```js
const { getAbility, executeAbility } = await import( /* webpackIgnore: true */ '@wordpress/abilities' );
```

### 6b. AI Welcome Message

Inside the `SettingsPage` component, add this `useEffect` after the `useState` declarations:

```js
    useEffect( () => {
        async function loadInstructionsMessage() {
            let prompt = '';
            prompt += 'A simple sentence encouraging the user to create a WordPress Post using AI. ';
            prompt += 'Only return the actual sentence. Do not include any additional text or formatting.';
            const text = await wp.aiClient.prompt(prompt).generateText();
            setNoticeMessage( text );
        }
        loadInstructionsMessage();

    }, [] );
```

### 6c. Generate Post via Ability

Replace the body of `generateFromInput` with:

```js
    const generateFromInput = useCallback( async () => {
        const generatePostAbility = getAbility( 'wp-ai-workshop-demo/generate-post' );
        if ( ! generatePostAbility ) {
            updateNotice('Whoops, post generation Ability not found.', 'error' );
            return;
        }
        try {
            updateNotice('Attempting to execute post generation Ability, please hold for updates...', 'info' );
            const result = await executeAbility( 'wp-ai-workshop-demo/generate-post', {
                title: input.title,
                prompt: input.prompt,
            } );
            console.log(result);
        } catch ( err ) {
            updateNotice('Error during post generation. Check console for details.', 'error' );
            console.error( err );
        } finally {
            updateNotice('Post generation completed!.', 'success' );
        }
    }, [ input ] );
```
