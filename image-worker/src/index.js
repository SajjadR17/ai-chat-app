const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		try {
			const { prompt } = await request.json();

			const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
				prompt,
			});

			console.log(result);

			const formData = new FormData();

			formData.append('file', `data:image/png;base64,${result.image}`);

			formData.append('upload_preset', env.CLOUDINARY_UPLOAD_PRESET);

			const upload = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
				method: 'POST',
				body: formData,
			});
			
			const data = await upload.json();

			if (!data.secure_url) {
				throw new Error(data.error?.message || 'Cloudinary upload failed');
			}

			return Response.json(
				{
					url: data.secure_url,
				},
				{
					headers: corsHeaders,
				},
			);
		} catch (error) {
			return Response.json(
				{
					error: error.message,
				},
				{
					status: 500,
					headers: corsHeaders,
				},
			);
		}
	},
};
