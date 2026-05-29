export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
