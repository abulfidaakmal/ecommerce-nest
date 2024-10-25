import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
      }),
    }),
  ],
  providers: [TestService],
})
export class TestModule {}
