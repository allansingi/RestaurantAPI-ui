export interface DishCode {
    code: string;
    description: string;
  }
  
  export interface Dish {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    code: DishCode;
    createdDate: string | Date;
    imageUrl: string;
  }  