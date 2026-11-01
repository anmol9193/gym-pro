@extends('layouts.site')
@section('title', 'Products | BEAST MODE Gym')
@section('description', 'Explore demo gym equipment and supplements: protein, creatine, pre-workout, mass gainer and daily essentials.')
@section('body-class', 'products-page')
@push('styles')
<link rel="stylesheet" href="{{ asset('assets/products.css') }}">
@endpush
@push('scripts')
<script src="{{ asset('assets/products.js') }}" defer></script>
@endpush
@section('content')
<main id="main">
  <header class="product-catalog-heading section-container" id="top"><nav class="product-breadcrumbs" aria-label="Breadcrumb"><a href="{{ route('home') }}#home">Home</a><span aria-hidden="true">/</span><span aria-current="page">Products</span></nav><div class="product-heading-row"><div><span class="eyebrow"><span class="status-dot"></span> THE BEAST MODE COLLECTION</span><h1>YOUR KIT.<br><span class="accent-text">YOUR FUEL.</span></h1></div><div class="product-heading-note"><span class="demo-label">DEMO COLLECTION / {{ count($products) }} PRODUCTS</span><p>Training gear and supplement concepts.<br> Explore the collection, find your next enquiry.</p><small>Concept visuals. Prices and availability on enquiry.</small></div></div></header>
  <section class="product-catalog section-container" data-product-catalog id="product-catalog" aria-label="Browse products">
    <div class="product-toolbar" data-product-controls hidden><div class="product-filters" role="group" aria-label="Filter products by category"><button type="button" data-product-filter="all" aria-pressed="true">All products <span>{{ count($products) }}</span></button><button type="button" data-product-filter="supplements" aria-pressed="false">Supplements <span>{{ count($supplements) }}</span></button><button type="button" data-product-filter="strength" aria-pressed="false">Strength</button><button type="button" data-product-filter="movement" aria-pressed="false">Movement</button><button type="button" data-product-filter="essentials" aria-pressed="false">Essentials</button></div><label class="product-search" for="product-search"><svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">Search products</span><input id="product-search" type="search" placeholder="Search products" maxlength="80" autocomplete="off"></label></div>
    <div class="supplement-type-toolbar" data-supplement-tools hidden><label for="supplement-type">Supplement type<select id="supplement-type"><option value="all">All supplement types</option><option value="protein">Protein</option><option value="creatine">Creatine</option><option value="pre-workout">Pre-workout</option><option value="mass-gainer">Mass gainer</option><option value="daily-essentials">Daily essentials</option></select></label><p>Demo packaging. Actual ingredients, pack sizes and prices on enquiry.</p></div>
    <div class="product-catalog-meta"><p data-product-count role="status" aria-live="polite">{{ count($products) }} products</p><span>DESIGNED TO SHOW UP WITH YOU.</span></div><div class="product-grid">
@foreach($products as $product)
@include('partials.product-card', ['product' => $product])
@endforeach
</div>
    <div class="product-empty" data-product-empty hidden><span class="eyebrow">LET'S TRY AGAIN</span><h2>No products found.</h2><p>Try a different name or browse the full collection.</p><button class="button button-primary" type="button" data-product-reset>Show all products <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></button></div>
    <noscript><p class="notice">All {{ count($products) }} demo products are shown. Open a product to see more views and enquiry details.</p></noscript>
  </section>
  <section class="product-catalog-end section-container"><span class="eyebrow">FIND YOUR SETUP</span><h2>GOT A QUESTION<br><span class="muted-heading">ABOUT THE COLLECTION?</span></h2><a class="button button-outline" href="{{ route('contact') }}#enquiry">Let's talk <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></a></section>
</main>
@endsection
