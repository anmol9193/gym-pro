<?php

namespace App\Http\Controllers;

use App\Support\SiteCatalog;
use Illuminate\Contracts\View\View;

final class PageController extends Controller
{
    public function home(SiteCatalog $catalog): View
    {
        return view('pages.home', [
            'products' => $catalog->products(),
            'supplements' => array_filter($catalog->products(), fn (array $product): bool => $product['category'] === 'supplements'),
            'featuredEquipment' => $catalog->productsBySlugs(['hex-dumbbell', 'training-kettlebell', 'studio-yoga-mat', 'training-duffel']),
            'featuredSupplements' => $catalog->productsBySlugs(['whey-protein', 'creatine-monohydrate', 'pre-workout', 'daily-multivitamin']),
        ]);
    }

    public function approach(): View
    {
        return view('pages.approach');
    }

    public function membership(): View
    {
        return view('pages.membership');
    }

    public function contact(SiteCatalog $catalog): View
    {
        return view('pages.contact', ['products' => $catalog->products()]);
    }
}
