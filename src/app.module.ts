import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product } from './product/entities/product.entity';
import { ProductModule } from './product/product.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const portStr = config.get<string>('DB_PORT');
				if (!portStr) {
					throw new Error('DB_PORT environment variable is not defined');
				}
				return {
					type: 'postgres',
					host: config.get<string>('DB_HOST'),
					port: parseInt(portStr, 10),
					username: config.get<string>('DB_USERNAME'),
					password: config.get<string>('DB_PASSWORD'),
					database: config.get<string>('DB_NAME'),
					entities: [Product],
					synchronize: true,
				};
			},
		}),
		ProductModule,
	],
})
export class AppModule {}
