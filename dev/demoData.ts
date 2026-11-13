import type { GraphEdge, GraphNode } from '../src/types'

export interface DemoGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const presets: Record<string, DemoGraph> = {
  knowledge: {
  

        "nodes": [
            {
                "id": "9008",
                "label": "第三章  金融资产",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "ab6ff30dff204069b721d1d7e52b230f",
                "uniqCode": "0df420c11b0841ff846dfc9ca8a5c277"
            },
            {
                "id": "9009",
                "label": "第四节  以公允价值计量且其变动计入其他综合收益的金融资产",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "7b464dc7981b4f36aaf8b43a4a64dc88",
                "uniqCode": "4b0e6624279344a987fac59fc9800906"
            },
            {
                "id": "9067",
                "label": "第一章   总论 ",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "63bc280480ac46318807b4a090794d89",
                "uniqCode": "27daf1f6707e4f1fa7f8343e66d134c9"
            },
            {
                "id": "9068",
                "label": "第三节 会计信息质量要求",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "04a7faee57574d859920b02725ae325f",
                "uniqCode": "cf14b3cef85e414d9128bd204b17fa8c"
            },
            {
                "id": "9157",
                "label": "第四章 存货",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "144d00054f9c47f1b7934ebcc7f91d12",
                "uniqCode": "500a5e01f809465a8fc593b876acfda2"
            },
            {
                "id": "9158",
                "label": "第一节  存货概述",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "b41185229e9346d2ac9d519c56731e54",
                "uniqCode": "c0b8d87a38214e588f4043b8eccc790c"
            },
            {
                "id": "10241",
                "label": "第一节  财务会计概念框架",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "c707093a215440a8842cfad847dae266",
                "uniqCode": "6039bdd502714e058a20c02f8037dd9b"
            },
            {
                "id": "12606",
                "label": "第五章 长期股权投资",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "080c6b70102e4131964868f8ea93b31f",
                "uniqCode": "8d540143965b4c6980e4b9296d0a409e"
            },
            {
                "id": "12607",
                "label": "第三节 长期股权投资的后续计量",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "6e29138c4f144566bcd63da26ad13eee",
                "uniqCode": "9bbbe4ca67a940a9ae18c64c421dd19f"
            },
            {
                "id": "13257",
                "label": "第六章   固定资产",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "13f5bfa609144beeadc6a633b087c222",
                "uniqCode": "b2e5b54b9b0f45feb7c78344e06e5fe9"
            },
            {
                "id": "13258",
                "label": "第三节 固定资产的后续计量",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "008b28a3bdd04b45886f1b7d1f2b210d",
                "uniqCode": "d61d95fc79ba43b9a47ac36e4890f089"
            },
            {
                "id": "14146",
                "label": "第七章    无形资产和投资性房地产",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "602ccae3d1904dc2900f60952e14c917",
                "uniqCode": "3988fdcd83264c2588ec39351d2bb852"
            },
            {
                "id": "14147",
                "label": "第二节  内部研究开发费用的确认和计量",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "369eb444318643cbb3e97cec31c85554",
                "uniqCode": "aa95a24fc59240ec8debb210e9b1b446"
            },
            {
                "id": "21331",
                "label": "第十章  所有者权益",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "23cd71ce2c674cd7b5613c75d6eb3cc3",
                "uniqCode": "d9b81417794e437d89aed0a300098632"
            },
            {
                "id": "21332",
                "label": " 第一节  所有者权益概述",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "dd1de48fb46248379059be147bd31472",
                "uniqCode": "0fa903e06c9f42e4a1257ed06b53cf2a"
            },
            {
                "id": "21335",
                "label": "第三节  其他权益工具和资本公积",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "fe556af4fb22422981f79ebca342020c",
                "uniqCode": "6764adb08cb942179e7e5080cab69db0"
            },
            {
                "id": "21337",
                "label": "第四节  其他综合收益",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "146aecd5165644b0866dc58e7cdb5b93",
                "uniqCode": "289d8bbf97e74da484a546f852206616"
            },
            {
                "id": "21339",
                "label": "第五节  留存收益",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "d0548c7cc0134e789d35aef7be545ff8",
                "uniqCode": "0a1fd76184544f6faa35a34a61da58e8"
            },
            {
                "id": "22226",
                "label": "第十一章 收入",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "6a0751fddc0b4235a6e61ae81e74984f",
                "uniqCode": "58310680d554455f992a2020449cf041"
            },
            {
                "id": "22227",
                "label": "第一节 收入概述",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "86618a0e2b984e2796e53432f4af756b",
                "uniqCode": "5b6d8c1dbdb04981868f12e008588984"
            },
            {
                "id": "24634",
                "label": "第三节  以摊余成本计量的金融资产",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "b81db002b0d34a3cbd3e0e38bfe8cd7b",
                "uniqCode": "926972c90e7f4f2cb490f7b51f11477f"
            },
            {
                "id": "25382",
                "label": "第十三章  政府补助",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "770d737caaad417a9baa98a0c0a98a0e",
                "uniqCode": "a54ab149cc88481a9ff84cad413c545c"
            },
            {
                "id": "25383",
                "label": "第二节  政府补助的会计处理",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "f9bada1dac894afba9bf864f5bf353a7",
                "uniqCode": "afc44fe2a5ad407ea1f79b9c309263db"
            },
            {
                "id": "25963",
                "label": "第十四章 利润",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "7260fd1bf54c439aa279697ec3d8e197",
                "uniqCode": "514ac468dcb34cc1905cc2d129650c57"
            },
            {
                "id": "25964",
                "label": "第二节 所得税",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "ea70b5f80d744d97a0efbe6cbc31a1b5",
                "uniqCode": "42991f7fa6244b738fd3945c1f160236"
            },
            {
                "id": "28594",
                "label": "第十五章  财务会计报告",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "3174d1f88e1c4c92bc9035fdd53c5da2",
                "uniqCode": "3bed630840194ea59474ef9f79bd95cd"
            },
            {
                "id": "28595",
                "label": "第四节  现金流量表",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "0eeffd0056424d2c9ccbd2e86697dfe3",
                "uniqCode": "feb78fd6f6eb44a784fb1794e11f0721"
            },
            {
                "id": "41499",
                "label": "第二章  货币资金和应收款项",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "151e26a980434c43b2bec089a49748d6",
                "uniqCode": "41da5425573e4727a5db8c3e9c4a1b5c"
            },
            {
                "id": "41500",
                "label": "第三节  其他货币资金",
                "type": "概念",
                "bookCode": "b087892de9ef4108ae952267adf8e0db",
                "chapterCode": "e793a5805aa1453ebf0b486c635baf90",
                "uniqCode": "00f431044496455d92ee2c1b8e19bda3"
            },
            {
                "id": "b087892de9ef4108ae952267adf8e0db",
                "label": "测试教材V3.0",
                "type": "Entity",
                "uniqCode": "b087892de9ef4108ae952267adf8e0db"
            }
        ],
        "edges": [
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "9008",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "9008",
                "target": "9009",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "9067",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "9067",
                "target": "9068",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "9157",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "9157",
                "target": "9158",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "9067",
                "target": "10241",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "12606",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "12606",
                "target": "12607",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "13257",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "13257",
                "target": "13258",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "14146",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "14146",
                "target": "14147",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "21331",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "21331",
                "target": "21332",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "21331",
                "target": "21335",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "21331",
                "target": "21337",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "21331",
                "target": "21339",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "22226",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "22226",
                "target": "22227",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "9008",
                "target": "24634",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "25382",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "25382",
                "target": "25383",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "25963",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "25963",
                "target": "25964",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "28594",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "28594",
                "target": "28595",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "b087892de9ef4108ae952267adf8e0db",
                "target": "41499",
                "label": "包含",
                "relation_type": "所属"
            },
            {
                "source": "41499",
                "target": "41500",
                "label": "包含",
                "relation_type": "所属"
            }
        ]
    

    

  },
  people: {
    nodes: [
      { id: 'lin', label: '林晨', type: '人物' },
      { id: 'wang', label: '王宁', type: '人物' },
      { id: 'zhou', label: '周敏', type: '人物' },
      { id: 'studio', label: '设计工作室', type: '组织' },
      { id: 'lab', label: '研究实验室', type: '组织' },
      { id: 'shanghai', label: '上海', type: '地点' },
    ],
    edges: [
      { source: 'lin', target: 'studio', label: '任职于', relation_type: '所属' },
      { source: 'wang', target: 'lab', label: '任职于', relation_type: '所属' },
      { source: 'zhou', target: 'lab', label: '任职于', relation_type: '所属' },
      { source: 'lin', target: 'wang', label: '合作', relation_type: '相关' },
      { source: 'studio', target: 'shanghai', label: '位于', relation_type: '所属' },
      { source: 'lab', target: 'shanghai', label: '位于', relation_type: '所属' },
    ],
  },
  empty: { nodes: [], edges: [] },
}

export function cloneGraph(data: DemoGraph): DemoGraph {
  return structuredClone(data)
}

export function parseGraphJson(input: string): DemoGraph {
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    throw new Error('JSON 格式有误，请检查标点和引号。')
  }

  if (!value || typeof value !== 'object') {
    throw new Error('数据应为包含 nodes 和 edges 的对象。')
  }

  const data = value as Record<string, unknown>
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('nodes 和 edges 都必须是数组。')
  }

  const ids = new Set<string>()
  for (const [index, item] of data.nodes.entries()) {
    if (!item || typeof item !== 'object') throw new Error(`节点 ${index + 1} 必须是对象。`)
    const node = item as Record<string, unknown>
    if (typeof node.id !== 'string' || !node.id.trim() || typeof node.label !== 'string') {
      throw new Error(`节点 ${index + 1} 需要非空字符串 id 和字符串 label。`)
    }
    if (ids.has(node.id)) throw new Error(`节点 id 重复：${node.id}`)
    ids.add(node.id)
  }

  for (const [index, item] of data.edges.entries()) {
    if (!item || typeof item !== 'object') throw new Error(`关系 ${index + 1} 必须是对象。`)
    const edge = item as Record<string, unknown>
    if (typeof edge.source !== 'string' || typeof edge.target !== 'string') {
      throw new Error(`关系 ${index + 1} 需要字符串 source 和 target。`)
    }
    if (!ids.has(edge.source) || !ids.has(edge.target)) {
      throw new Error(`关系 ${index + 1} 引用了不存在的节点。`)
    }
  }

  return data as unknown as DemoGraph
}
