# tg-php

PHP handlers to make building PHP sites and services trivial.

* [Installing](#installing)
* [Using](#using)
* [Contributing](#contributing)

### Installing

We suggest pulling `tg-php` down as a [`git subtree`](https://manpages.debian.org/testing/git-man/git-subtree.1.en.html):

```
git remote add tg-php git@github.com:svidgen/tg-php.git
git subtree add --prefix=vendor/svidgen/tg-php tg-php master
php vendor/svidgen/tg-php/install.php
```

### Using

To start using `tg-php` stuff in your project:
```
<?php

require(__DIR__ . '/vendor/autoload.php');

class Widget {
	use \TG\Document;
}

?>
```

(Further documentation pending.)

Etc.

### Contributing
```
git clone git@github.com:svidgen/tg-php && cd tg-php
```

