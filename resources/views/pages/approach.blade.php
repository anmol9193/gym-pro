@extends('layouts.site')
@section('title', 'Our Approach | BEAST MODE Gym')
@section('description', 'Discover the BEAST MODE approach: purposeful training, personal guidance, consistent habits and a community that supports your next chapter.')
@section('body-class', 'approach-page')
@push('styles')
<link rel="stylesheet" href="{{ asset('assets/approach.css') }}">
@endpush
@section('content')
<main id="main">
  <header class="approach-hero section-container" id="top">
    <div class="approach-hero-copy">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="{{ route('home') }}#home">Home</a><span aria-hidden="true">/</span><span aria-current="page">Our approach</span></nav>
      <span class="eyebrow"><span class="status-dot"></span> THE BEAST MODE APPROACH</span>
      <h1>MORE INTENT.<br><span class="accent-text">MORE YOU.</span></h1>
      <p>Training should fit your life, challenge your starting point and give you a reason to come back. We believe in building the whole journey, one purposeful session at a time.</p>
      <div class="approach-hero-actions"><a class="button button-primary" href="#process">Discover our process <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></a><a class="text-link" href="{{ route('programs.index') }}">Find your program <svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg></a></div>
      <div class="approach-hero-footnote"><span class="status-dot"></span> YOUR PACE. YOUR PROGRESS. OUR SUPPORT.</div>
    </div>
    <div class="approach-hero-visual" data-tilt><img class="hero-photo" src="{{ asset('assets/coaching.jpg') }}" width="1000" height="667" alt="Athlete practising controlled core movements in a bright training space" fetchpriority="high"><span class="approach-photo-label">BODY. MIND. EVERYDAY LIFE.</span><div class="approach-photo-caption"><span>PROGRESS IS PERSONAL.</span><strong>SO IS OUR APPROACH.</strong></div><span class="approach-photo-bolt" aria-hidden="true"><svg class="icon"><use href="#icon-bolt"/></svg></span></div>
  </header>
  <section class="approach-principles section-container section-pad" aria-labelledby="principles-heading">
    <div class="section-heading reveal"><div><span class="eyebrow">WHAT WE COME BACK TO</span><h2 id="principles-heading">A MINDSET.<br><span class="muted-heading">BEFORE A WORKOUT.</span></h2></div><p>Clear purpose. Personal attention.<br>Small actions that add up.</p></div>
    <div class="principles-grid">
      <article class="principle reveal"><span class="principle-number">01</span><h3>Train with purpose.</h3><p>Know what you are working towards. Start with your goals and build a routine that makes each session feel meaningful.</p><span class="principle-foot">INTENT OVER GUESSWORK</span></article>
      <article class="principle reveal"><span class="principle-number">02</span><h3>Build more than muscle.</h3><p>Make space for movement, everyday nutrition and recovery. Training is one part of a routine that needs to work in real life.</p><span class="principle-foot">THE WHOLE PICTURE MATTERS</span></article>
      <article class="principle reveal"><span class="principle-number">03</span><h3>Keep showing up.</h3><p>Choose habits you can return to. Celebrate your effort, learn from the difficult days and focus on your own next step.</p><span class="principle-foot">CONSISTENCY OVER PERFECTION</span></article>
    </div>
  </section>
  <section class="approach-process section-pad" id="process" aria-labelledby="process-heading"><div class="section-container process-layout"><div class="process-intro reveal"><span class="eyebrow">HOW YOUR JOURNEY TAKES SHAPE</span><h2 id="process-heading">A PLAN.<br>A PROCESS.<br><span class="accent-text">YOUR PROGRESS.</span></h2><p>A clear starting point makes the next step easier. Here is the approach behind your training journey at BEAST MODE.</p><a class="text-link" href="{{ route('contact') }}#enquiry">Find my starting point <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></a></div><ol class="process-steps">
    <li class="reveal"><span class="process-number" aria-hidden="true">01</span><div><h3>Start with your story.</h3><p>Talk about your goals, experience and everyday routine. Your starting point helps shape the conversation.</p></div></li>
    <li class="reveal"><span class="process-number" aria-hidden="true">02</span><div><h3>Find your way to move.</h3><p>Explore strength, conditioning, personal training or mindful movement. Choose a direction that interests you.</p><a class="text-link" href="{{ route('programs.index') }}">Explore the programs <svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg></a></div></li>
    <li class="reveal"><span class="process-number" aria-hidden="true">03</span><div><h3>Put the plan into practice.</h3><p>Focus on purposeful sessions, sound movement and steady habits. Ask questions and work at an appropriate pace.</p></div></li>
    <li class="reveal"><span class="process-number" aria-hidden="true">04</span><div><h3>Reflect. Adjust. Keep going.</h3><p>Notice what feels different, discuss the challenges and review your next goals. Progress is personal and rarely a straight line.</p></div></li>
  </ol></div></section>
  <section class="journey-section section-pad section-container" id="results"><div class="section-heading reveal"><div><span class="eyebrow">YOUR JOURNEY / ONE STEP AT A TIME</span><h2>YOU DON'T FIND IT.<br><span class="accent-text">YOU BUILD IT.</span></h2></div><p>One session at a time.<br>A little stronger than before.</p></div><div class="journey-layout reveal"><div class="journey-story"><span class="journey-index" id="journey-index">01</span><span class="eyebrow" id="journey-label">WEEK 01 / THE FIRST STEP</span><h3 id="journey-title">Just show up.<br>That's your first win.</h3><p id="journey-description">Meet your coach, get comfortable with the gym and build a routine you can come back to.</p><div class="journey-tabs" role="tablist" aria-label="Example training roadmap"><button type="button" role="tab" id="week-tab-0" aria-selected="true" aria-controls="journey-panel" data-week="0">Week 01</button><button type="button" role="tab" id="week-tab-1" aria-selected="false" aria-controls="journey-panel" data-week="1" tabindex="-1">Week 04</button><button type="button" role="tab" id="week-tab-2" aria-selected="false" aria-controls="journey-panel" data-week="2" tabindex="-1">Week 08</button><button type="button" role="tab" id="week-tab-3" aria-selected="false" aria-controls="journey-panel" data-week="3" tabindex="-1">Week 12</button></div><small>An example roadmap. Your pace and progress are personal.</small></div><div class="journey-panel" id="journey-panel" role="tabpanel" aria-labelledby="week-tab-0" tabindex="0"><div class="journey-panel-top"><span>YOUR NEXT CHAPTER</span><svg class="icon" aria-hidden="true"><use href="#icon-bolt"/></svg></div><div class="growth-chart" aria-hidden="true"><div style="--bar:23%"><span></span></div><div style="--bar:32%"><span></span></div><div style="--bar:28%"><span></span></div><div style="--bar:45%"><span></span></div><div style="--bar:40%"><span></span></div><div style="--bar:55%"><span></span></div><div style="--bar:50%"><span></span></div><div style="--bar:68%"><span></span></div><div style="--bar:63%"><span></span></div><div style="--bar:79%"><span></span></div><div style="--bar:74%"><span></span></div><div style="--bar:96%"><span></span></div></div><div class="chart-axis" aria-hidden="true"><span>DAY ONE</span><span>ONE DAY AT A TIME →</span></div><div class="journey-milestone"><span class="milestone-icon"><svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg></span><div><span>YOUR FOCUS</span><strong id="journey-focus">Build the habit.</strong></div><span class="milestone-badge" id="journey-badge">FOUNDATION</span></div></div></div></section>
  <section class="owner-section section-pad section-container" id="owner" aria-labelledby="owner-heading">
    <div class="owner-layout">
      <div class="owner-visual reveal" data-tilt>
        <div class="owner-portrait">
          <img src="{{ asset('assets/owner-demo.jpg') }}" width="1000" height="1500" alt="Illustrative portrait for the sample gym owner profile" loading="lazy">
          <span class="owner-sample">Sample profile</span>
          <span class="owner-photo-mark" aria-hidden="true"><svg class="icon"><use href="#icon-bolt"/></svg></span>
          <div class="owner-identity"><h3>Arjun Mehra</h3><p>Owner &amp; Community Builder</p><span>BEAST MODE GYM</span></div>
        </div>
        <div class="owner-card-note"><span class="status-dot"></span> BUILT ON PURPOSE. POWERED BY PEOPLE.</div>
      </div>
      <div class="owner-copy reveal">
        <span class="eyebrow">MEET THE OWNER</span>
        <h2 id="owner-heading">THE HEART BEHIND<br><span class="accent-text">THE HUSTLE.</span></h2>
        <p class="owner-intro">Meet <strong>Arjun Mehra</strong>, the driving force behind BEAST MODE. Passionate about strength training and bringing people together, he believes a great gym should help you feel welcome from your very first session.</p>
        <p>His vision is simple: purposeful training, steady habits and a community that celebrates effort. From your first rep to your next personal best, the aim is to help you keep moving forward.</p>
        <blockquote class="owner-quote"><p>"You don't need to be the strongest person in the room. Just keep showing up for yourself."</p><cite>Arjun Mehra <span>Owner, BEAST MODE Gym</span></cite></blockquote>
        <ul class="owner-values" aria-label="Our owner's values"><li>People first</li><li>Train with purpose</li><li>Consistency always</li></ul>
        <a class="text-link" href="{{ route('contact') }}#enquiry">Start your journey with us <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></a>
      </div>
    </div>
  </section>
  <section class="approach-invite section-container" aria-labelledby="invite-heading"><div class="approach-invite-shell reveal"><div><span class="eyebrow">YOUR NEXT CHAPTER STARTS WITH ONE STEP.</span><h2 id="invite-heading">LET'S BUILD<br>YOUR STRONG.</h2><p>Explore the programs, find your people and make room for your next chapter.</p></div><div class="approach-invite-actions"><a class="button button-dark" href="{{ route('contact') }}#enquiry">Start my free week <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></a><a class="text-link" href="{{ route('programs.index') }}">Explore programs <svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg></a></div></div></section>
  <section class="faq-section section-container section-pad"><div class="faq-heading reveal"><span class="eyebrow">A LITTLE CLARITY HELPS</span><h2>YOUR QUESTIONS.<br><span class="muted-heading">OUR APPROACH.</span></h2><p>Start with the information you need.</p></div><div class="faq-list reveal"><details><summary>Do I need experience before joining?<span aria-hidden="true">+</span></summary><p>No. Share your current experience and goals with the team so you can discuss a suitable starting point and training pace.</p></details><details><summary>How do I choose where to start?<span aria-hidden="true">+</span></summary><p>Read the program descriptions or select "Help me find my starting point" in the enquiry form. Your interests and everyday routine are useful starting points for the conversation.</p></details><details><summary>Does everyone follow the same training journey?<span aria-hidden="true">+</span></summary><p>No. The example roadmap shows how habits can develop over time. Your training pace, goals and progress will depend on your own circumstances.</p></details><details><summary>What if my goals change?<span aria-hidden="true">+</span></summary><p>Bring it up with your coach or the gym team. Reviewing your goals and discussing a different direction is part of building a routine that works for you.</p></details></div></section>
</main>
@endsection
