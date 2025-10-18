/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@nestjs/common'

@Injectable()
export class CreditService {
    constructor() { }

    findAll() {
        return 'Hello Credit Engine'
    }
}
