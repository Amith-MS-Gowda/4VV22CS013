const AUTH_TOKEN = "your_access_token_here";


export async function Log(stack, level, pkg, message) {
  try {

    await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message
      })
    });
  } catch (error) {
    console.error('Logging to external service failed:', error);
  }
}