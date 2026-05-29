export function apiError(
  message: string,
  status = 400,
  code?: string,
): Response {
  return Response.json(
    {
      error: {
        error_code: code ?? statusToCode(status),
        message,
      },
    },
    { status },
  )
}

function statusToCode(status: number): string {
  switch (status) {
    case 401:
      return "unauthorized"
    case 404:
      return "not_found"
    case 409:
      return "conflict"
    default:
      return "bad_request"
  }
}
