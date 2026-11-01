@extends('layouts.management')
@section('title', 'Configuration')
@section('content')
<div class="mg-page-heading"><div><span class="mg-eyebrow">GYM CONFIGURATION</span><h1>A solid starting point.</h1><p>Current foundation settings for this gym.</p></div></div><section class="mg-panel mg-form-panel mg-configuration"><h2>Workspace configuration</h2><p>Settings shown here come from the server configuration. Database passwords and secret keys are never displayed.</p><dl>@foreach(['Gym name'=>config('gym.name'),'Gym timezone'=>config('gym.timezone'),'Application URL'=>config('app.url'),'Environment'=>app()->environment(),'Session storage'=>config('session.driver'),'Email channel'=>config('mail.default')] as $label=>$value)<div><dt>{{ $label }}</dt><dd>{{ $value }}</dd></div>@endforeach</dl></section>
@endsection
