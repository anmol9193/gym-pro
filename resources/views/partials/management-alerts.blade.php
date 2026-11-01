@if(session('status'))<div class="alert mg-alert-success" role="status">{{ session('status') }}</div>@endif
@if($errors->any())<div class="alert mg-alert-error" role="alert"><strong>Please check the details below.</strong><ul class="mb-0 mt-2">@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>@endif
