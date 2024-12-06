export async function handler(event, context) {
  try {
    const response = await fetch(process.env.DEPLOY_HOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "POST request successful",
        response: data,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
}
