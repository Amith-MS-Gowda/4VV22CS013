const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbWl0aG1zZ293ZGF3b3JrQGdtYWlsLmNvbSIsImV4cCI6MTc1MzI1MjE1NiwiaWF0IjoxNzUzMjUxMjU2LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNmNhMjk4Y2YtOTI2Yi00YmY5LTkwNTQtNDA4MzQxNWIwOWQxIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW1pdGggbSBzIGdvd2RhIiwic3ViIjoiZDBmNTI4MTEtOTE4Yi00MTBlLWJlNjgtNGEwMmYyOGEyYjliIn0sImVtYWlsIjoiYW1pdGhtc2dvd2Rhd29ya0BnbWFpbC5jb20iLCJuYW1lIjoiYW1pdGggbSBzIGdvd2RhIiwicm9sbE5vIjoiNHZ2MjJjczAxMyIsImFjY2Vzc0NvZGUiOiJ0cVRTcEQiLCJjbGllbnRJRCI6ImQwZjUyODExLTkxOGItNDEwZS1iZTY4LTRhMDJmMjhhMmI5YiIsImNsaWVudFNlY3JldCI6IlRLWkVza2RhVFNicXhaZXcifQ.wj13GOXE0GepdOVqBCWvViWEugOmEeUGMhRnt7vcaxw";

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