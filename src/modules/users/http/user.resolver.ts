/* istanbul ignore file */
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateUserDto, UserOutput } from "./dtos/create-users.dto";
import { UsersService } from "../domain/users.service";

@Resolver('User')
export class UserResolver {

    constructor(private readonly usersService: UsersService) { }

    @Query(() => [UserOutput])
    findAll(): Promise<UserOutput[]> {
        return this.usersService.findAll()
    }

    @Query(() => UserOutput, { nullable: true })
    findUser(@Args('id', { type: () => Int }) id: number): Promise<UserOutput | null> {
        return this.usersService.findById(id)
    }

    @Mutation(() => UserOutput)
    create(@Args('data') args: CreateUserDto): Promise<UserOutput> {
        return this.usersService.create(args)
    }

}