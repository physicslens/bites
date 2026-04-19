declare module "papaparse" {
  export function parse(input: string | File, config?: any): any;
  const Papa: any;
  export default Papa;
}
