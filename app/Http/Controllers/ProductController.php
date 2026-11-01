<?php

namespace App\Http\Controllers;

use App\Support\SiteCatalog;
use Illuminate\Contracts\View\View;

final class ProductController extends Controller
{
    public function index(SiteCatalog $catalog): View
    {
        $products = $catalog->products();
        $supplements = array_values(array_filter($products, fn (array $product): bool => $product['category'] === 'supplements'));
        $equipment = array_values(array_filter($products, fn (array $product): bool => $product['category'] !== 'supplements'));

        return view('products.index', [
            'products' => [...$supplements, ...$equipment],
            'supplements' => $supplements,
        ]);
    }

    public function show(string $slug, SiteCatalog $catalog): View
    {
        $product = $catalog->product($slug);
        abort_if($product === null, 404);

        return view('products.show', [
            'product' => $product,
            'relatedProducts' => $catalog->productsBySlugs($product['related']),
        ]);
    }
}
