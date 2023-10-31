export class Billing {
    constructor(
        public billId: string,
        public custId: number,
        public custName: string,
        public custMobile: string
    ) {}
}