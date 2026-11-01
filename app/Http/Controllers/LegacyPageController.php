<?php

namespace App\Http\Controllers;

use App\Support\SiteCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class LegacyPageController extends Controller
{
    public function __invoke(Request $request, string $legacy, SiteCatalog $catalog): RedirectResponse
    {
        $pages = [
            'index' => 'home',
            'programs' => 'programs.index',
            'products' => 'products.index',
            'our-approach' => 'approach',
            'membership' => 'membership',
            'contact' => 'contact',
        ];

        if (isset($pages[$legacy])) {
            $path = route($pages[$legacy], absolute: false);
        } elseif (str_starts_with($legacy, 'product-') && $catalog->product(substr($legacy, 8)) !== null) {
            $path = route('products.show', ['slug' => substr($legacy, 8)], false);
        } elseif ($catalog->program($legacy) !== null) {
            $path = route('programs.show', ['slug' => $legacy], false);
        } else {
            abort(404);
        }

        $query = http_build_query($request->query(), '', '&', PHP_QUERY_RFC3986);

        return redirect()->to($path.($query === '' ? '' : '?'.$query), 301);
    }
}
