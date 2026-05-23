export async function onRequest(context) {
  const url = new URL(context.request.url)
  const targetUrl = `${context.env.API_URL}${url.pathname.replace('/proxy', '')}${url.search}`

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: {
      'CF-Access-Client-Id': context.env.CF_CLIENT_ID,
      'CF-Access-Client-Secret': context.env.CF_CLIENT_SECRET,
    },
  })

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
