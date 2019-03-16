check:
	deno --allow-read --allow-run --allow-write https://deno.land/x/license_checker@v1.5.0/main.ts --inject
	deno --fmt
