# tg-php
PHP handlers to make building PHP sites and services trivial.

### Contributing
```
git clone git@github.com:svidgen/tg-php && cd tg-php
```

### Using
If you don't already have [composer](https://getcomposer.org/) installed, install it:
```
curl -sS https://getcomposer.org/installer | php
```

Add this repository to the `composer.json` file at the root of your package:
```
{
	"type": "vcs",
	"url": "https://github.com/svidgen/tg-dom"
}
```

And this package to your `require` section:
```
"svidgen/tg-dom": "master"
```

If this is your only dependency, your `composer.json` could look like this:
```
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/svidgen/tg-php"
        }
    ],
    "require": {
        "svidgen/tg-php": "master"
    }
}
```

Run the composer install/update.
```
php composer.phar update
php vendor/svidgen/tg-php/install.php
```

And start using `tg-php` stuff in your project:
```
<?php

require(__DIR__ . '/vendor/autoload.php');

class Widget {
	use \TG\Document;
}

?>
```

Etc.
